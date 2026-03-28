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


const createTickets = async(req, res) => {
    const {title, description, priority, creatorId} = req.body;
    if (!title || !description || !priority || !creatorId) {
        return res.status(400).json({message: 'Missing requierd fields'});
    }
    try {
        const query = ` 
            INSERT INTO Tickets (title, description, priority, creator_id, status) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
        `;

        const values = [title, description, priority, creatorId, 'Open'];
        const result = await pool.query(query, values);
        const newTicket = result.rows[0];

        const formattedTicket = {
            id: newTicket.id,
            title: newTicket.title,
            description: newTicket.description,
            status: newTicket.status,
            priority: newTicket.priority,
            slaDeadline: newTicket.sla_deadline || null,
            creatorId: newTicket.creator_id,
            assignedTechnician: newTicket.assigned_technician || null,
            evidence: [], // Evidence placeholder for future sprint
            createdAt: newTicket.created_at,
            updatedAt: newTicket.updated_at,
        };
        res.status(200).json(newTicket);
    } catch (error) {
        console.error('Database Error during POST /api/tickets', error);
        res.status(500).json({message: 'Database Error'});
    }

};
module.exports = {
    getTickets,
    createTickets
};