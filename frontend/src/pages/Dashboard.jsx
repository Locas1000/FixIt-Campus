// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService'; // <-- 1. NEW: Import the user service

import Sidebar from '../components/layouts/Sidebar';
import TicketFeed from '../components/domain/TicketFeed';
import AssigneeSidebar from '../components/domain/AssigneeSidebar';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';
import CreateTicketModal from '../components/domain/CreateTicketModal';

export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]); // <-- 2. NEW: State for API technicians

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeMobileView, setActiveMobileView] = useState('feed');
    const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const outlet = useOutlet();
    const location = useLocation();

    const currentUserRole = 'Dispatcher';
    const showWorkspaceFeed = location.pathname === '/dashboard';

    useEffect(() => {
        const savedTheme = localStorage.getItem('fixit_theme') || 'dark';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
    }, []);

    // 3. NEW: Fetch both tickets AND technicians
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Run both API calls at the same time!
                // Note: Make sure 'Technician' matches exactly what your backend expects
                const [ticketsData, techsData] = await Promise.all([
                    ticketService.getTickets(),
                    userService.getUsersByRole('Technician')

                ]);
// ADD THESE TWO LINES:
                console.log("ONE TICKET LOOKS LIKE THIS:", ticketsData[0]);
                console.log("ONE TECH LOOKS LIKE THIS:", techsData[0]);
                setTickets(ticketsData);
                setTechnicians(techsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
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

    const handleTicketCreated = useCallback((newTicket) => {
        setTickets(prev => [newTicket, ...prev]);
    }, []);

   const filteredTickets = useMemo(() => {
    // If no one is selected, show all tickets
    if (!selectedAssigneeId) return tickets;

    // Filter tickets where the assignedTechnicianId matches exactly
    return tickets.filter(t => t.assignedTechnicianId === selectedAssigneeId);
}, [tickets, selectedAssigneeId]);


    return (
        <div className="d-flex vh-100 w-100 overflow-hidden" style={{ background: 'var(--bs-body-bg)', color: 'var(--bs-body-color)' }}>

            <div className={`border-end ${activeMobileView === 'sidebar' ? 'd-flex w-100' : 'd-none d-md-flex'}`} style={{width: '240px', flexShrink: 0, borderColor: 'var(--auth-border-color)'}}>
                <Sidebar role={currentUserRole} onOpenCreateModal={() => setIsCreateModalOpen(true)} />
            </div>

            {!showWorkspaceFeed ? (
                <div className={`flex-grow-1 overflow-auto ${activeMobileView === 'sidebar' ? 'd-none d-md-block' : 'd-block'}`} style={{backgroundColor: 'var(--bs-body-bg)'}}>
                    {outlet}
                </div>
            ) : (
                <>
                    <div className={`d-flex flex-column border-end ${activeMobileView === 'feed' ? 'd-flex w-100' : 'd-none d-md-flex'}`} style={{width: selectedTicket ? '380px' : undefined, flexShrink: selectedTicket ? 0 : undefined, flex: selectedTicket ? undefined : '1', borderColor: 'var(--auth-border-color)', transition: 'width 0.2s ease'}}>
                        {isLoading ? (
                            <div className="d-flex justify-content-center align-items-center h-100"><div className="spinner-border text-primary" role="status"></div></div>
                        ) : error ? (
                            <div className="p-3 text-danger text-center">Error: {error}</div>
                        ) : (
                            <TicketFeed tickets={filteredTickets} onSelectTicket={handleSelectTicket} selectedTicketId={selectedTicket?.id} />
                        )}
                    </div>

                    <div className={`flex-grow-1 overflow-hidden h-100 ${activeMobileView === 'detail' ? 'd-flex w-100' : activeMobileView === 'metrics' ? 'd-block w-100' : selectedTicket ? 'd-flex w-100' : 'd-none d-xl-block w-100'}`} style={{minWidth: 0}}>
                        {selectedTicket ? (
                            <TicketDetailPanel ticket={selectedTicket} onBackToFeed={handleBackToFeed} onTicketUpdated={handleTicketUpdated} />
                        ) : (
                            <AssigneeSidebar
                                tickets={tickets}
                                technicians={technicians}
                                selectedAssigneeId={selectedAssigneeId} // changed prop name
                                onSelectAssignee={setSelectedAssigneeId}
                            />
                        )}
                    </div>
                </>
            )}

            <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onTicketCreated={handleTicketCreated} />
        </div>
    );
}