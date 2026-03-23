const pool = require('../config/db');

const getTickets = async(req, res) => {
    // These 2 objects strictly match the Ticket Object structure from the contract
    try {
        const result = await pool.query('SELECT * FROM Tickets ORDER BY created_at DESC');
        const tickets = result.rows.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            slaDeadline: ticket.slaDeadline,
            creatorId: ticket.creatorId,
            assignedTechnitian: ticket.assignedTechnitian,
            evidence: [],
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
        }));

        // Return the array of Ticket Objects with a 200 OK status
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Database Error', error)
        res.status(500).json({message: 'Database Error'});
    }
};
module.exports = {
    getTickets
};