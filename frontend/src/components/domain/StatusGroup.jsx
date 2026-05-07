// src/components/domain/StatusGroup.jsx
import React, { useState } from 'react';
import TicketRow from './TicketRow';

const STATUS_META = {
    'In Progress': { color: '#F5A623', icon: '◑' },
    'Open':        { color: '#D8D8D8', icon: '○' },
    'Assigned':    { color: '#6b7280', icon: '◎' },
    'Backlog':     { color: '#8A8F98', icon: '○' },
    'Resolved':    { color: '#8b5cf6', icon: '◕' },
    'Confirmed':   { color: '#06b6d4', icon: '⬡' },
    'QA':          { color: '#BD10E0', icon: '⬡' },
    'Closed':      { color: '#7ED321', icon: '●' },
    'Blocked':     { color: '#ef4444', icon: '⊗' },
};

export default function StatusGroup({ status, tickets, onSelectTicket, selectedTicketId }) {
    const [isOpen, setIsOpen] = useState(true);

    if (tickets.length === 0) return null;

    const meta = STATUS_META[status] || { color: '#D8D8D8', icon: '○' };

    return (
        <div className="mb-4">
            {/* Group Header */}
            <div
                className="d-flex align-items-center px-1 mb-2 user-select-none"
                style={{ cursor: 'pointer', color: 'var(--bs-secondary-color)' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className={`bi bi-chevron-${isOpen ? 'down' : 'right'} me-2`} style={{ fontSize: '0.75rem' }}></i>
                <span className="me-2" style={{ fontSize: '0.8rem', color: meta.color }}>{meta.icon}</span>
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
                            onSelect={onSelectTicket}
                            isSelected={ticket.id === selectedTicketId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
