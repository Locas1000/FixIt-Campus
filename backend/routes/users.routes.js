// backend/routes/users.routes.js
const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/users.controller');

// Matches GET /api/users (and supports the ?role= query param)
router.get('/', getUsers);

module.exports = router;