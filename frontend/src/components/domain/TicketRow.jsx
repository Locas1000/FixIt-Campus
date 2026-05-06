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

            {/* ID */}
            <div className="text-muted text-uppercase me-3 flex-shrink-0" style={{ fontSize: '0.75rem', width: '80px', letterSpacing: '0.5px' }}>
                TKT-{String(ticket.id).substring(0, 4)}
            </div>

            {/* Title */}
            <div className="flex-grow-1 text-truncate" style={{ fontSize: '0.875rem', color: 'var(--bs-body-color)' }}>
                {ticket.title}
            </div>

            {/* Properties (Right Aligned) */}
            <div className="d-flex align-items-center gap-3 ms-3">
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

                {/* Category Badge */}
                <span className="badge rounded-pill border d-none d-lg-inline" style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--auth-border-color)',
                    color: 'var(--bs-secondary-color)',
                    fontWeight: 'normal',
                    fontSize: '0.7rem'
                }}>
                    {ticket.category}
                </span>

                {/* Date */}
                <div className="text-end text-muted d-none d-sm-block" style={{ fontSize: '0.75rem', width: '60px' }}>
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
