// backend/routes/tickets.routes.js
const express = require('express');
const router = express.Router();
const { getTickets, createTickets, updateTicketStatus} = require('../controllers/tickets.controller');


// GET /api/tickets
router.get('/', getTickets);

router.post('/', createTickets);

router.put('/:id/status' , updateTicketStatus)
module.exports = router;