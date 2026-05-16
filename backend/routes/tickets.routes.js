// backend/routes/tickets.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer to store files in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

const {
    getTickets,
    createTickets,
    updateTicketStatus,
    getTicketHistory,
    updateTicketAssignee,
    updateTicketPriority
} = require('../controllers/tickets.controller');

// GET /api/tickets
router.get('/', getTickets);

// POST /api/tickets
// Added the multer middleware here to handle the image file upload
router.post('/', upload.single('evidence'), createTickets);

// PUT /api/tickets/:id/status
router.put('/:id/status', updateTicketStatus);

// PUT /api/tickets/:id/assignee
router.put('/:id/assignee', updateTicketAssignee);

// PUT /api/tickets/:id/priority
router.put('/:id/priority', updateTicketPriority);

// GET /api/tickets/:id/history
router.get('/:id/history', getTicketHistory);

module.exports = router;