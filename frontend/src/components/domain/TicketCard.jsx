import React from 'react';
import { getStatusColor, getPriorityColor } from '../../utils/statusHelpers';

const TicketCard = ({ ticket }) => {
  const { title, priority, status, createdAt } = ticket;

  const dateFormatted = new Date(createdAt).toLocaleDateString();

  return (
    <div 
      className="border rounded-1 p-3 mb-2 bg-white shadow-sm-hover cursor-pointer transition-all"
      style={{ cursor: 'pointer' }}
      onClick={() => console.log(`Opening ticket: ${title}`)}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '70%' }}>
          {title}
        </h6>
        {/* Priority Badge */}
        <span className={`badge rounded-pill ${getPriorityColor(priority)}`}>
          {priority}
        </span>
      </div>

      <div className="d-flex justify-content-between align-items-center small mt-3">
        <div className="text-muted">
          Created: {dateFormatted}
        </div>
        {/* Status text using our previous helper */}
        <span className={`fw-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default TicketCard;