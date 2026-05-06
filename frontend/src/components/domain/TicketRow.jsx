import React from 'react';

export default function TicketRow({ ticket, isLast }) {
  return (
    <div
      className={`d-flex align-items-center py-2 px-3 ticket-row-hover ${!isLast ? 'border-bottom' : ''}`}
      style={{
        borderColor: 'var(--auth-border-color)',
        cursor: 'pointer',
        minHeight: '44px',
        transition: 'background-color 0.15s ease'
      }}
      onClick={() => console.log('Clicked Ticket:', ticket.id)}
    >
      {/* ID */}
      <div className="text-muted text-uppercase me-3" style={{ fontSize: '0.75rem', width: '80px', letterSpacing: '0.5px' }}>
        {/* Safely cast the ID to a string before slicing, works for Ints or UUIDs */}
        TKT-{String(ticket.id).substring(0, 4)}
      </div>

      {/* Title */}
      <div className="flex-grow-1 text-truncate" style={{ fontSize: '0.875rem', color: 'var(--bs-body-color)' }}>
        {ticket.title}
      </div>

      {/* Properties (Right Aligned) */}
      <div className="d-flex align-items-center gap-3 ms-3">
        {/* Category Badge */}
        <span className="badge rounded-pill border" style={{
          backgroundColor: 'transparent',
          borderColor: 'var(--auth-border-color)',
          color: 'var(--bs-secondary-color)',
          fontWeight: 'normal',
          fontSize: '0.7rem'
        }}>
          {ticket.category}
        </span>

        {/* Date */}
        <div className="text-end text-muted" style={{ fontSize: '0.75rem', width: '60px' }}>
          {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        {/* Assignee Avatar */}
        {ticket.assignedTechnicianId ? (
           <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}>
             {/* THE FIX: Safely cast to string, then grab the first character */}
             {String(ticket.assignedTechnicianId).charAt(0).toUpperCase()}
           </div>
        ) : (
          <div className="rounded-circle border border-dashed"
               style={{ width: '20px', height: '20px', borderColor: 'var(--auth-border-color)' }}></div>
        )}
      </div>
    </div>
  );
}