// src/components/domain/StatusGroup.jsx
import React, { useState } from 'react';
import TicketRow from './TicketRow';

export default function StatusGroup({ status, tickets }) {
    const [isOpen, setIsOpen] = useState(true);

    if (tickets.length === 0) return null; // Don't render empty groups

    // Map status to a specific icon color (Linear aesthetic)
    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return '#F5A623'; // Warning Yellow
            case 'Open': return '#D8D8D8';       // Grey
            case 'Backlog': return '#8A8F98';    // Muted Grey
            case 'QA': return '#BD10E0';         // Purple
            case 'Closed': return '#7ED321';     // Green
            default: return '#D8D8D8';
        }
    };

    return (
        <div className="mb-4">
            {/* Group Header */}
            <div
                className="d-flex align-items-center px-1 mb-2 user-select-none"
                style={{ cursor: 'pointer', color: 'var(--bs-secondary-color)' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className={`bi bi-chevron-${isOpen ? 'down' : 'right'} me-2`} style={{ fontSize: '0.75rem' }}></i>
                <i className="bi bi-circle me-2" style={{ fontSize: '0.75rem', color: getStatusColor(status) }}></i>
                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
          {status}
        </span>
                <span className="ms-3 text-muted" style={{ fontSize: '0.8rem' }}>
          {tickets.length}
        </span>
            </div>

            {/* Ticket List */}
            {isOpen && (
                <div className="d-flex flex-column border rounded-3 overflow-hidden" style={{ borderColor: 'var(--auth-border-color)' }}>
                    {tickets.map((ticket, index) => (
                        <TicketRow
                            key={ticket.id}
                            ticket={ticket}
                            isLast={index === tickets.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}