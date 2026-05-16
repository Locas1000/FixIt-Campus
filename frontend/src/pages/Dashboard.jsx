// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { ticketService } from '../services/ticketService';

import Sidebar from '../components/layouts/Sidebar';
import TicketFeed from '../components/domain/TicketFeed';
import AssigneeSidebar from '../components/domain/AssigneeSidebar';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';

// IMPORT THE MODAL
import CreateTicketModal from '../components/domain/CreateTicketModal';

export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeMobileView, setActiveMobileView] = useState('feed');

    // MODAL STATE
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const outlet = useOutlet();
    const location = useLocation();

    const currentUserRole = 'Dispatcher';
    const showWorkspaceFeed = location.pathname === '/dashboard';

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

    const handleSelectTicket = useCallback((ticket) => {
        setSelectedTicket(ticket);
        setActiveMobileView('detail');
    }, []);

    const handleTicketUpdated = useCallback((updatedTicket) => {
        setTickets(prev =>
            prev.map(t => t.id === updatedTicket.id ? updatedTicket : t)
        );
        setSelectedTicket(updatedTicket);
    }, []);

    const handleBackToFeed = () => {
        setActiveMobileView('feed');
        setSelectedTicket(null);
    };

    // INSTANT FEED UPDATE
    const handleTicketCreated = useCallback((newTicket) => {
        setTickets(prev => [newTicket, ...prev]);
    }, []);

    return (
        <div className="d-flex vh-100 w-100 overflow-hidden bg-body-bg text-body-color" data-bs-theme="dark">

            {/* PANE 1: LEFT SIDEBAR */}
            <div
                className={`border-end ${activeMobileView === 'sidebar' ? 'd-flex w-100' : 'd-none d-md-flex'}`}
                style={{width: '240px', flexShrink: 0, borderColor: 'var(--auth-border-color)'}}
            >
                {/* PASSING THE PROP TO THE SIDEBAR! */}
                <Sidebar
                    role={currentUserRole}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                />
            </div>

            {/* DYNAMIC CONTENT SWITCHER */}
            {!showWorkspaceFeed ? (
                <div
                    className={`flex-grow-1 overflow-auto ${activeMobileView === 'sidebar' ? 'd-none d-md-block' : 'd-block'}`}
                    style={{backgroundColor: '#09090b'}}>
                    {outlet}
                </div>
            ) : (
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

                    {/* PANE 3: DETAIL PANEL */}
                    <div
                        className={`flex-grow-1 overflow-hidden ${
                            activeMobileView === 'detail'
                                ? 'd-flex w-100'
                                : activeMobileView === 'metrics'
                                    ? 'd-block w-100'
                                    : selectedTicket
                                        ? 'd-flex'
                                        : 'd-none d-xl-block'
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

            {/* MOUNT THE MODAL OUTSIDE OF THE FLEXBOX GRID */}
            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTicketCreated={handleTicketCreated}
            />

        </div>
    );
}