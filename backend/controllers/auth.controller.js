const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

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
            avatarUrl: newUser.avatar_url || null,
            createdAt: newUser.created_at
        };

        res.status(201).json({
            token,
            user: userResponse
        });

    }catch(error) {
        console.error("ERROR Register:", error);
        res.status(500).json({
            message: 'Internal Server Error',
            dev_info: error.message
        });
    }
}

module.exports = {
    login,
    register
};

