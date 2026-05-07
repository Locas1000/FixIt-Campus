// src/components/domain/TicketRow.jsx
import React from 'react';

// Status icon mapping to match the Linear aesthetic
const STATUS_ICONS = {
    'Open':        { icon: '○', color: '#6b7280' },
    'Assigned':    { icon: '◎', color: '#6b7280' },
    'In Progress': { icon: '◑', color: '#F5A623' },
    'Resolved':    { icon: '◕', color: '#8b5cf6' },
    'Confirmed':   { icon: '⬡', color: '#06b6d4' },
    'Closed':      { icon: '●', color: '#7ED321' },
    'Blocked':     { icon: '⊗', color: '#ef4444' },
};

const PRIORITY_COLORS = {
    'High':   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    'Medium': { color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    'Low':    { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

export default function TicketRow({ ticket, isLast, onSelect, isSelected }) {
    const statusDef = STATUS_ICONS[ticket.status] || STATUS_ICONS['Open'];
    const priorityDef = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS['Low'];

    return (
        <div
            className={`d-flex align-items-center py-2 px-3 ticket-row-hover ${!isLast ? 'border-bottom' : ''}`}
            style={{
                borderColor: 'var(--auth-border-color)',
                cursor: 'pointer',
                minHeight: '44px',
                transition: 'background-color 0.15s ease',
                backgroundColor: isSelected ? 'var(--auth-border-color)' : undefined,
            }}
            onClick={() => onSelect && onSelect(ticket)}
        >
            {/* Status Icon */}
            <div className="me-2 flex-shrink-0" style={{ width: '18px', textAlign: 'center' }}>
                <span style={{ color: statusDef.color, fontSize: '0.8rem' }}>{statusDef.icon}</span>
            </div>

            {/* ID - Narrowed width to save space */}
            <div className="text-muted text-uppercase me-2 flex-shrink-0" style={{ fontSize: '0.75rem', width: '55px', letterSpacing: '0.5px' }}>
                TKT-{String(ticket.id).substring(0, 4)}
            </div>

            {/* Title - The Magic Fix: minWidth: 0 lets text-truncate work inside flexbox */}
            <div className="flex-grow-1 text-truncate pe-2" style={{ fontSize: '0.875rem', color: 'var(--bs-body-color)', minWidth: 0 }}>
                {ticket.title}
            </div>

            {/* Properties (Right Aligned) - Added flex-shrink-0 so it never squishes */}
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                {/* Priority badge */}
                <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '500',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: priorityDef.bg,
                    color: priorityDef.color,
                    border: `1px solid ${priorityDef.color}33`,
                    letterSpacing: '0.02em',
                }}>
                    {ticket.priority}
                </span>

                {/* Date - Replaced responsive classes with a CSS trick to hide on squeeze if needed, but it should fit now */}
                <div className="text-end text-muted d-none d-lg-block" style={{ fontSize: '0.75rem', width: '45px' }}>
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>

                {/* Assignee Avatar */}
                {ticket.assignedTechnicianId ? (
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white flex-shrink-0"
                        style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}>
                        {String(ticket.assignedTechnicianId).charAt(0).toUpperCase()}
                    </div>
                ) : (
                    <div className="rounded-circle border flex-shrink-0"
                        style={{ width: '20px', height: '20px', borderColor: 'var(--auth-border-color)', borderStyle: 'dashed' }}></div>
                )}
            </div>
        </div>
    );
}