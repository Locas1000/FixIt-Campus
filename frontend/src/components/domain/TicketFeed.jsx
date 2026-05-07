// src/components/domain/TicketFeed.jsx
import React, { useMemo } from 'react';
import StatusGroup from './StatusGroup';

// Ordered to match the natural workflow progression
const STATUS_ORDER = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Confirmed', 'Blocked', 'Closed'];

export default function TicketFeed({ tickets, onSelectTicket, selectedTicketId }) {
    const groupedTickets = useMemo(() => {
        const groups = {};
        STATUS_ORDER.forEach(s => { groups[s] = []; });

        tickets.forEach(ticket => {
            if (groups[ticket.status] !== undefined) {
                groups[ticket.status].push(ticket);
            } else {
                if (!groups['Other']) groups['Other'] = [];
                groups['Other'].push(ticket);
            }
        });

        return groups;
    }, [tickets]);

    return (
        <div className="h-100 overflow-y-auto w-100 pt-4 px-4 pb-5 custom-scrollbar">
            {/* Feed Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--auth-border-color)' }}>
                <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                    <i className="bi bi-stack" style={{ fontSize: '1.2rem' }}></i> Issues
                </h5>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {tickets.length} total
                </span>
            </div>

            {/* Render Status Groups in workflow order */}
            {Object.entries(groupedTickets).map(([status, groupTickets]) => (
                <StatusGroup
                    key={status}
                    status={status}
                    tickets={groupTickets}
                    onSelectTicket={onSelectTicket}
                    selectedTicketId={selectedTicketId}
                />
            ))}
        </div>
    );
}
