// backend/controllers/users.controller.js
const pool = require('../config/db');

const getUsers = async (req, res) => {
    const { role } = req.query;

    try {
        // Selecting specialty and avatar_url since they are in the schema
        // and highly relevant for the frontend UI
        let query = 'SELECT id, name, email, role, specialty, avatar_url FROM Users';
        const queryParams = [];

        if (role) {
            // Postgres ENUMs are case-sensitive, so 'Technician' must match exactly
            query += ' WHERE role = $1';
            queryParams.push(role);
        }

        query += ' ORDER BY name ASC';

        const result = await pool.query(query, queryParams);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database Error during GET /api/users:', error);
        res.status(500).json({ message: 'Database Error' });
    }
};

module.exports = {
    getUsers
};;