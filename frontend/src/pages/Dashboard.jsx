// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useOutlet,useLocation} from 'react-router-dom'; // <-- 1. Import useOutlet
import { ticketService } from '../services/ticketService';

// Layout Components
import Sidebar from '../components/layouts/Sidebar';
import TicketFeed from '../components/domain/TicketFeed';
import AssigneeSidebar from '../components/domain/AssigneeSidebar';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';

export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // The currently selected ticket (null = no selection, show AssigneeSidebar)
    const [selectedTicket, setSelectedTicket] = useState(null);

    // Mobile: 'sidebar' | 'feed' | 'detail'
    const [activeMobileView, setActiveMobileView] = useState('feed');

    // <-- 2. Hook to check if a nested route (like Settings) is active
    const outlet = useOutlet();
    const location = useLocation(); // <-- Add this

    const currentUserRole = 'Dispatcher';
    const showWorkspaceFeed = location.pathname === '/dashboard';
    // Fetch all tickets on mount
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

    // Called when a TicketRow is clicked
    const handleSelectTicket = useCallback((ticket) => {
        setSelectedTicket(ticket);
        setActiveMobileView('detail');
    }, []);

    // Called when a ticket is updated inside the detail panel (optimistic sync)
    const handleTicketUpdated = useCallback((updatedTicket) => {
        setTickets(prev =>
            prev.map(t => t.id === updatedTicket.id ? updatedTicket : t)
        );
        setSelectedTicket(updatedTicket);
    }, []);

    // Mobile back button handler
    const handleBackToFeed = () => {
        setActiveMobileView('feed');
        setSelectedTicket(null);
    };

    return (
        <div className="d-flex vh-100 w-100 overflow-hidden bg-body-bg text-body-color" data-bs-theme="dark">

            {/* PANE 1: LEFT SIDEBAR — always visible on md+ (THIS IS WHAT WENT MISSING!) */}
            <div
                className={`border-end ${activeMobileView === 'sidebar' ? 'd-block w-100' : 'd-none d-md-block'}`}
                style={{width: '240px', flexShrink: 0, borderColor: 'var(--auth-border-color)'}}
            >
                <Sidebar role={currentUserRole}/>
            </div>

            {/* DYNAMIC CONTENT SWITCHER */}
            {!showWorkspaceFeed ? (
                /* IF NESTED ROUTE (e.g., /settings or /triage) */
                <div
                    className={`flex-grow-1 overflow-auto ${activeMobileView === 'sidebar' ? 'd-none d-md-block' : 'd-block'}`}
                    style={{backgroundColor: '#09090b'}}>
                    {outlet}
                </div>
            ) : (
                /* IF /dashboard: Render your 3-Pane Workspace with actual data */
                <>
                    {/* PANE 2: TICKET FEED */}
                    <div
                        className={`d-flex flex-column border-end ${activeMobileView === 'feed' ? 'd-flex w-100' : 'd-none d-md-flex'}`}
                        style={{
                            width: selectedTicket ? '340px' : undefined,
                            flexShrink: selectedTicket ? 0 : undefined,
                            flex: selectedTicket ? undefined : '1',
                            borderColor: 'var(--auth-border-color)',
                            transition: 'width 0.2s ease',
                        }}
                    >
                        {isLoading ? (
                            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                                Loading workspace...
                            </div>
                        ) : error ? (
                            <div className="h-100 d-flex align-items-center justify-content-center text-danger">
                                {error}
                            </div>
                        ) : (
                            <TicketFeed
                                tickets={tickets}
                                onSelectTicket={handleSelectTicket}
                                selectedTicketId={selectedTicket?.id}
                            />
                        )}
                    </div>

                    {/* PANE 3: DETAIL PANEL or ASSIGNEE SIDEBAR */}
                    <div
                        className={`flex-grow-1 overflow-hidden ${
                            activeMobileView === 'detail'
                                ? 'd-flex w-100'
                                : activeMobileView === 'metrics'
                                    ? 'd-block w-100'
                                    : selectedTicket
                                        ? 'd-flex'           // show detail on desktop
                                        : 'd-none d-xl-block' // show assignee sidebar on xl
                        }`}
                        style={{minWidth: 0}}
                    >
                        {selectedTicket ? (
                            <TicketDetailPanel
                                ticket={selectedTicket}
                                onBackToFeed={handleBackToFeed}
                                onTicketUpdated={handleTicketUpdated}
                            />
                        ) : (
                            <AssigneeSidebar tickets={tickets}/>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}