const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const formatUserResponse = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at
});

const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        const user = result.rows[0];


        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({message: 'Unauthorized'});
        }

        const token = jwt.sign(
            {id: user.id, role: user.role},
            process.env.JWT_SECRET || 'secret_key_temporal',
            {expiresIn: '8h'}
        );

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            specialty: user.specialty || null,
            avatarUrl: user.avatar_url || null,
            createdAt: user.created_at ? user.created_at.toISOString() : new Date().toISOString()
        };

        return res.status(200).json({
            token: token,
            user: userResponse
        });

    } catch(error){
        // Log the full error to the backend terminal securely
        console.error("ERROR Login:", error);

        // Only send a generic error to the frontend
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

const register = async (req, res) => {
    const {name, email, password, role} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    try {
        const userExists = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (userExists.rows.length > 0){
            return res.status(409).json({message: 'Email already in use.'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'User';

        const result = await db.query(
            'INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, userRole]
        );

        const newUser = result.rows[0];

        const token = jwt.sign(
            {id: newUser.id, role: newUser.role},
            process.env.JWT_SECRET || 'secret_key_temporal',
            {expiresIn: '24h'}
        );

        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            specialty: newUser.specialty || null,
            avatarUrl: newUser.avatar_url || null,
            createdAt: newUser.created_at
        };

        res.status(201).json({
            token,
            user: userResponse
        });

    }catch(error) {
        res.status(500).json({
            message: 'Internal Server Error',
            dev_info: error.message
        });
    }
}
const googleLogin = async (req, res) => {
    // 1. Receive the access_token instead of idToken
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ message: 'Access token is required' });
    }

    try {
        // 2. Fetch the user's profile from Google using the access_token
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        if (!googleResponse.ok) {
            throw new Error("Failed to fetch user profile from Google");
        }

        const googleUser = await googleResponse.json();
        const { email, email_verified, name, picture } = googleUser;

        if (!email || (email_verified !== true && email_verified !== 'true')) {
            return res.status(400).json({ message: 'Google account email must be present and verified' });
        }

        // 3. Database logic stays the exact same!
        let result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            const newUser = await db.query(
                'INSERT INTO Users (name, email, role, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, email, 'User', picture]
            );
            user = newUser.rows[0];
        } else if (!user.avatar_url && picture) {
            await db.query('UPDATE Users SET avatar_url = $1 WHERE id = $2', [picture, user.id]);
            user.avatar_url = picture;
        }

        // 4. Generate FixIt JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key_temporal',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error("Google Auth Error:", error.message);
        res.status(400).json({ message: 'Invalid Google Token' });
    }
};


module.exports = {
    login,
    register,
    googleLogin // Make sure to export it!
};
