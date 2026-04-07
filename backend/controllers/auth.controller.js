const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../config/db');
const router = require("../routes/auth.routes");

const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        const user = result.rows[0];

        console.log("Usuario encontrado:", user);

        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }

        const isMatch = (password === user.password_hash);
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
        console.error("ERROR Login",error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
            stack: error.stack
        });
    }
};

module.exports = {
    login
};

