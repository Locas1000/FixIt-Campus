// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';

// Layout Components
import Sidebar from '../components/layouts/Sidebar';
import TicketFeed from '../components/domain/TicketFeed';
import AssigneeSidebar from '../components/domain/AssigneeSidebar';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeMobileView, setActiveMobileView] = useState('feed');
  const currentUserRole = 'Dispatcher';

  // Fetch Tickets on Mount
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const data = await ticketService.getTickets();
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="d-flex vh-100 w-100 overflow-hidden bg-body-bg text-body-color" data-bs-theme="dark">

      {/* PANE 1: LEFT SIDEBAR */}
      <div className={`border-end border-color ${activeMobileView === 'sidebar' ? 'd-block w-100' : 'd-none d-md-block'}`} style={{ width: '240px', borderColor: 'var(--auth-border-color)' }}>
        <Sidebar role={currentUserRole} />
      </div>

      {/* PANE 2: MAIN TICKET FEED */}
      <div className={`d-flex flex-column border-end border-color flex-grow-1 ${activeMobileView === 'feed' ? 'd-flex w-100' : 'd-none d-md-flex'}`} style={{ borderColor: 'var(--auth-border-color)' }}>
        {isLoading ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-muted">Loading workspace...</div>
        ) : error ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-danger">{error}</div>
        ) : (
          <TicketFeed tickets={tickets} />
        )}
      </div>

      {/* PANE 3: RIGHT ASSIGNEE/METRICS SIDEBAR */}
      <div className={`bg-body-bg ${activeMobileView === 'metrics' ? 'd-block w-100' : 'd-none d-xl-block'}`} style={{ width: '300px' }}>
        <AssigneeSidebar tickets={tickets} />
      </div>

    </div>
  );
}