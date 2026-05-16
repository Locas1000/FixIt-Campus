// backend/controllers/tickets.controller.js
const pool = require('../config/db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getTickets = async(req, res) => {
    try {
        const query = `
            SELECT 
                t.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', ti.id,
                            'url', ti.image_url,
                            'comment', ti.evidence_comment,
                            'uploadedAt', ti.uploaded_at
                        )
                    ) FILTER (WHERE ti.id IS NOT NULL), 
                    '[]'::json
                ) as evidence
            FROM Tickets t
            LEFT JOIN TicketImages ti ON t.id = ti.ticket_id
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `;

        const result = await pool.query(query);

        const tickets = result.rows.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            category: ticket.category,
            status: ticket.status,
            priority: ticket.priority,
            slaDeadline: ticket.sla_deadline || null,
            creatorId: ticket.creator_id,
            assignedTechnicianId: ticket.assigned_technician_id || null,
            evidence: ticket.evidence,
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
        }));

        res.status(200).json(tickets);
    } catch (error) {
        console.error('Database Error', error);
        res.status(500).json({message: 'Database Error'});
    }
};

const createTickets = async (req, res) => {
    const { title, description, priority, creatorId, category } = req.body;

    if (!title || !description || !priority || !creatorId || !category) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const ticketQuery = `
            INSERT INTO Tickets (title, description, priority, creator_id, status, category)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const ticketValues = [title, description, priority, creatorId, 'Open', category];
        const ticketResult = await client.query(ticketQuery, ticketValues);
        const newTicket = ticketResult.rows[0];

        const savedEvidence = [];

        // Handle the image if multer found one in req.file
        if (req.file) {
            const uploadToCloudinary = new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'fixit_campus_evidence' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            const cloudinaryResult = await uploadToCloudinary;

            const evidenceQuery = `
                INSERT INTO TicketImages (ticket_id, image_url, evidence_comment)
                VALUES ($1, $2, $3) RETURNING *;
            `;
            const evResult = await client.query(evidenceQuery, [newTicket.id, cloudinaryResult.secure_url, 'Attached upon creation']);

            savedEvidence.push({
                id: evResult.rows[0].id,
                url: evResult.rows[0].image_url,
                comment: evResult.rows[0].evidence_comment,
                uploadedAt: evResult.rows[0].uploaded_at
            });
        }

        await client.query('COMMIT');

        const formattedTicket = {
            id: newTicket.id,
            title: newTicket.title,
            description: newTicket.description,
            category: newTicket.category,
            status: newTicket.status,
            priority: newTicket.priority,
            slaDeadline: newTicket.sla_deadline || null,
            creatorId: newTicket.creator_id,
            assignedTechnicianId: newTicket.assigned_technician_id || null,
            evidence: savedEvidence,
            createdAt: newTicket.created_at,
            updatedAt: newTicket.updated_at,
        };

        res.status(201).json(formattedTicket);
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Database Error during POST /api/tickets', error);
        res.status(500).json({ message: 'Database Error' });
    } finally {
        if (client) client.release();
    }
};

const updateTicketStatus = async (req,res) => {
    const {id} = req.params;
    const {newStatus,comment,userId}= req.body;

    const Status = [ 'Open', 'Assigned', 'In Progress', 'Resolved', 'Confirmed', 'Closed', 'Blocked']

    if (!Status.includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid Status provided' });
    }

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

        // Fetch evidence so it isn't wiped out on the frontend
        const evidenceResult = await client.query(
            'SELECT id, image_url as url, evidence_comment as comment, uploaded_at as "uploadedAt" FROM TicketImages WHERE ticket_id = $1',
            [id]
        );

        const formattedTicket = {
            id: updatedTicket.id,
            title: updatedTicket.title,
            description: updatedTicket.description,
            category: updatedTicket.category,
            status: updatedTicket.status,
            priority: updatedTicket.priority,
            slaDeadline: updatedTicket.sla_deadline || null,
            creatorId: updatedTicket.creator_id,
            assignedTechnicianId: updatedTicket.assigned_technician_id || null,
            evidence: evidenceResult.rows,
            createdAt: updatedTicket.created_at,
            updatedAt: updatedTicket.updated_at,
        };

        res.status(200).json(formattedTicket);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database Error during PUT /api/tickets', error);
        res.status(500).json({ message: 'Database Error' });
    } finally {
        client.release();
    }
};
const updateTicketAssignee = async (req, res) => {
    const { id } = req.params;
    const { assigneeId, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required for the audit log' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE Tickets
            SET assigned_technician_id = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
                RETURNING *;
        `;
        const updateResult = await client.query(updateQuery, [assigneeId, id]);

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ message: 'Ticket ID not found' });
        }

        const updatedTicket = updateResult.rows[0];

        // ── Fetch the Technician's name for a clean log string ──
        let comment = 'Ticket unassigned';
        if (assigneeId) {
            const techResult = await client.query('SELECT name FROM Users WHERE id = $1', [assigneeId]);
            const techName = techResult.rows[0]?.name || `#${assigneeId}`;
            comment = `Assigned to Technician ${techName}`;
        }

        const historyQuery = `
            INSERT INTO TicketHistory (ticket_id, previous_status, new_status, changed_by_user_id, change_comment)
            VALUES ($1, $2, $3, $4, $5);
        `;
        await client.query(historyQuery, [id, updatedTicket.status, updatedTicket.status, userId, comment]);

        await client.query('COMMIT');

        // Fetch evidence so it isn't wiped out on the frontend
        const evidenceResult = await client.query(
            'SELECT id, image_url as url, evidence_comment as comment, uploaded_at as "uploadedAt" FROM TicketImages WHERE ticket_id = $1',
            [id]
        );

        const formattedTicket = {
            id: updatedTicket.id,
            title: updatedTicket.title,
            description: updatedTicket.description,
            category: updatedTicket.category,
            status: updatedTicket.status,
            priority: updatedTicket.priority,
            slaDeadline: updatedTicket.sla_deadline || null,
            creatorId: updatedTicket.creator_id,
            assignedTechnicianId: updatedTicket.assigned_technician_id,
            evidence: evidenceResult.rows,
            createdAt: updatedTicket.created_at,
            updatedAt: updatedTicket.updated_at,
        };

        res.status(200).json(formattedTicket);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database Error during PUT /api/tickets/:id/assignee', error);
        res.status(500).json({ message: 'Database Error' });
    } finally {
        client.release();
    }
};


const updateTicketPriority = async (req, res) => {
    const { id } = req.params;
    const { priority, userId } = req.body;

    const validPriorities = ['Low', 'Medium', 'High'];
    if (!validPriorities.includes(priority)) {
        return res.status(400).json({ message: 'Invalid Priority provided' });
    }

    if (!userId) {
        return res.status(400).json({ message: 'userId is required for the audit log' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE Tickets
            SET priority = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;
        const updateResult = await client.query(updateQuery, [priority, id]);

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ message: 'Ticket ID not found' });
        }

        const updatedTicket = updateResult.rows[0];

        const historyQuery = `
            INSERT INTO TicketHistory (ticket_id, previous_status, new_status, changed_by_user_id, change_comment)
            VALUES ($1, $2, $3, $4, $5);
        `;
        const comment = `Priority changed to ${priority}`;
        await client.query(historyQuery, [id, updatedTicket.status, updatedTicket.status, userId, comment]);

        await client.query('COMMIT');

        // Fetch evidence so it isn't wiped out on the frontend
        const evidenceResult = await client.query(
            'SELECT id, image_url as url, evidence_comment as comment, uploaded_at as "uploadedAt" FROM TicketImages WHERE ticket_id = $1',
            [id]
        );

        const formattedTicket = {
            id: updatedTicket.id,
            title: updatedTicket.title,
            description: updatedTicket.description,
            category: updatedTicket.category,
            status: updatedTicket.status,
            priority: updatedTicket.priority,
            slaDeadline: updatedTicket.sla_deadline || null,
            creatorId: updatedTicket.creator_id,
            assignedTechnicianId: updatedTicket.assigned_technician_id,
            evidence: evidenceResult.rows,
            createdAt: updatedTicket.created_at,
            updatedAt: updatedTicket.updated_at,
        };

        res.status(200).json(formattedTicket);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database Error during PUT /api/tickets/:id/priority', error);
        res.status(500).json({ message: 'Database Error' });
    } finally {
        client.release();
    }
};

const getTicketHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT
                th.id,
                th.ticket_id,
                th.previous_status,
                th.new_status,
                th.changed_by_user_id,
                th.change_comment,
                th.changed_at,
                u.name as user_name
            FROM tickethistory th
                     LEFT JOIN Users u ON th.changed_by_user_id = u.id
            WHERE th.ticket_id = $1
            ORDER BY th.changed_at DESC
        `;

        const result = await pool.query(query, [id]);

        const history = result.rows.map(row => ({
            id: row.id,
            ticketId: row.ticket_id,
            changedByUserId: row.changed_by_user_id,
            changedByUserName: row.user_name || `User #${row.changed_by_user_id}`, // Fallback if name is missing
            previousStatus: row.previous_status,
            newStatus: row.new_status,
            changedAt: row.changed_at,
            comment: row.change_comment
        }));

        res.status(200).json(history);

    } catch (error) {
        console.error('Error ticket History', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    getTickets,
    createTickets,
    updateTicketStatus,
    updateTicketAssignee,
    updateTicketPriority,
    getTicketHistory
};