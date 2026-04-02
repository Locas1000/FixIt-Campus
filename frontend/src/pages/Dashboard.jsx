import { useState } from 'react';
import dummyTickets from '../data/dummyTickets.json';

// Child Components (Your dev will create these in the components folder)
import Sidebar from '../components/layouts/Sidebar';
import TicketFeed from '../components/domain/TicketFeed';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';

export default function Dashboard() {
  // 1. The Application State (The "Brain")
  // Null means no ticket is currently selected by the user.
  const [selectedTicket, setSelectedTicket] = useState(null);

  // 2. Responsive Mobile State
  // Since mobile can only show one pane at a time, we track the active view.
  // Options: 'sidebar', 'feed', 'detail'
  const [activeMobileView, setActiveMobileView] = useState('feed');

  // 3. User Role Mock (Until authentication is implemented)
  const currentUserRole = 'Dispatcher';

  // Helper to handle ticket selection and force mobile view to details
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setActiveMobileView('detail');
  };

  return (
    <div className="d-flex vh-100 w-100 overflow-hidden bg-body-bg text-body-color">

      {/* =========================================
          PANE 1: SIDEBAR
          ========================================= */}
      {/* Hide on mobile unless activeMobileView === 'sidebar' */}
      <div className={`border-end border-color ${activeMobileView === 'sidebar' ? 'd-block w-100' : 'd-none d-md-block'}`} style={{ width: '250px' }}>
        <Sidebar role={currentUserRole} />
      </div>

      {/* =========================================
          PANE 2: TICKET FEED (The List)
          ========================================= */}
      {/* Hide on mobile unless activeMobileView === 'feed' */}
      <div className={`d-flex flex-column border-end border-color ${activeMobileView === 'feed' ? 'd-flex w-100' : 'd-none d-md-flex'}`} style={{ width: '350px', backgroundColor: '#ffffff' }}>
        <TicketFeed
          tickets={dummyTickets}
          onTicketClick={handleTicketSelect}
          activeTicketId={selectedTicket?.id}
        />
      </div>

      {/* =========================================
          PANE 3: TICKET DETAIL PANEL
          ========================================= */}
      {/* Hide on mobile unless activeMobileView === 'detail' */}
      <div className={`flex-grow-1 bg-body-bg ${activeMobileView === 'detail' ? 'd-block w-100' : 'd-none d-md-block'}`}>
        {selectedTicket ? (
          <TicketDetailPanel
            ticket={selectedTicket}
            onBackToFeed={() => setActiveMobileView('feed')}
          />
        ) : (
          // Empty State when no ticket is clicked
          <div className="h-100 d-flex align-items-center justify-content-center text-muted">
            <p>Select a ticket from the feed to view details.</p>
          </div>
        )}
      </div>

    </div>
  );
}