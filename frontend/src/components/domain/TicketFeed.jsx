// src/components/domain/TicketFeed.jsx
import React, { useMemo } from 'react';
import StatusGroup from './StatusGroup';

export default function TicketFeed({ tickets }) {
  // Group tickets by status
  const groupedTickets = useMemo(() => {
    const groups = {
      'In Progress': [],
      'Open': [], // Equivalent to "Todo"
      'Backlog': [],
      'QA': [], // Or 'Resolved' depending on your DB enums
      'Closed': []
    };

    tickets.forEach(ticket => {
      // Push to the array if the key exists, otherwise create a catch-all "Other"
      if (groups[ticket.status]) {
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
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-color" style={{ borderColor: 'var(--auth-border-color)' }}>
        <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
          <i className="bi bi-stack" style={{ fontSize: '1.2rem' }}></i> Issues
        </h5>
      </div>

      {/* Render Accordions */}
      {Object.entries(groupedTickets).map(([status, groupTickets]) => (
        <StatusGroup key={status} status={status} tickets={groupTickets} />
      ))}
    </div>
  );
}