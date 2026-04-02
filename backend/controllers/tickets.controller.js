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
            slaDeadline: ticket.sla_deadline || null,
            creatorId: ticket.creator_id,
            assignedTechnicianId: ticket.assigned_technician_id || null, // Fixed naming
            evidence: [],
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
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
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
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
            assignedTechnicianId: newTicket.assigned_technician || null,
            evidence: [], // Evidence placeholder for future sprint
            createdAt: newTicket.created_at,
            updatedAt: newTicket.updated_at,
        };
        res.status(201).json(formattedTicket);
    } catch (error) {
        console.error('Database Error during POST /api/tickets', error);
        res.status(500).json({message: 'Database Error'});
    }
};

const updateTicketStatus = async (req,res) => {
    const {id} = req.params;
    const {newStatus,comment,userId}= req.body;

    const Status = [ 'Open',
        'Assigned',
        'In Progress',
        'Resolved',
        'Confirmed',
        'Closed',
        'Blocked']

    if (!Status.includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid Status provided' });
    }

    // Bouncer: Require user ID to fulfill the Audit Log schema
    if (!userId) {
        return res.status(400).json({ message: 'userId is required for the audit log' });
    }
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        const updateQuery = `
            UPDATE Tickets
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
                RETURNING *;
        `;
        const updateValues = [newStatus, id];
        const updateResult = await client.query(updateQuery, updateValues);
        if (updateResult.rows.length === 0){
            await client.query('ROLLBACK')
            client.release();
            return res.status(404).json({message:'Ticket ID not found'})
        }
        const updatedTicket = updateResult.rows[0];
        const historyQuery = `
            INSERT INTO TicketHistory (ticket_id, new_status, changed_by_user_id, change_comment)
            VALUES ($1, $2, $3, $4);
        `;
        const historyValues = [id, newStatus, userId, comment || null];
        await client.query(historyQuery, historyValues);

        await client.query('COMMIT');

        const formattedTicket = {
            id: updatedTicket.id,
            title: updatedTicket.title,
            description: updatedTicket.description,
            status: updatedTicket.status,
            priority: updatedTicket.priority,
            slaDeadline: updatedTicket.sla_deadline || null,
            creatorId: updatedTicket.creator_id,
            assignedTechnicianId: updatedTicket.assigned_technician_id || null,
            evidence: [],
            createdAt: updatedTicket.created_at,
            updatedAt: updatedTicket.updated_at,
        };

        res.status(200).json(formattedTicket);

    } catch (error) {
        await client.query('ROLLBACK'); // Undo everything if a DB error occurs
        console.error('Database Error during PUT /api/tickets', error);
        res.status(500).json({ message: 'Database Error' });
    } finally {
        client.release();
    }
};

module.exports = {
    getTickets,
    createTickets,
    updateTicketStatus
};