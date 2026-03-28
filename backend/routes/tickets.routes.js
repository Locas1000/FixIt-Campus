// backend/routes/tickets.routes.js
const express = require('express');
const router = express.Router();
const { getTickets, createTickets } = require('../controllers/tickets.controller');


// GET /api/tickets
router.get('/', getTickets);

router.post('/', createTickets);

module.exports = router;