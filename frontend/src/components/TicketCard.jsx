import React from 'react';
import './TicketCard.css';
import { getStatusColor } from '../utils/statusHelpers';

function TicketCard({ title, status, priority }) {
  return (
    <div className="ticket-card">
      <h3>{title}</h3>
      {/* The getStatusColor function provides the Bootstrap class here */}
      <p>
        Status: <span className={getStatusColor(status)}>{status}</span>
      </p>
      <p>Priority: {priority}</p>
    </div>
  );
}

export default TicketCard;