// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutlet, useLocation,useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService'; // <-- 1. NEW: Import the user service
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layouts/Sidebar';
import TicketFeed from '../components/domain/TicketFeed';
import AssigneeSidebar from '../components/domain/AssigneeSidebar';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';
import CreateTicketModal from '../components/domain/CreateTicketModal';

export default function Dashboard() {
    const { user } = useAuth(); // <-- 1. Pull the user from context
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]); // <-- 2. NEW: State for API technicians

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeMobileView, setActiveMobileView] = useState('feed');
    const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssigneePanelOpen, setIsAssigneePanelOpen] = useState(true);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState(null);

    const outlet = useOutlet();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const currentUserRole = user?.role || 'User';
    const showWorkspaceFeed = location.pathname === '/dashboard';
    const navigate = useNavigate();

    // ── SECURITY REDIRECT ──
    // If an unauthorized user manually navigates to /dashboard, bounce them to My Tickets
    useEffect(() => {
        if (showWorkspaceFeed && !['Dispatcher'].includes(currentUserRole)) {
            navigate('/my-tickets', { replace: true });
        }
    }, [showWorkspaceFeed, currentUserRole, navigate]);
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
        setSelectedTicket(prevTicket => {
            // Check if the ticket we clicked is the same one that is already open
            if (prevTicket && prevTicket.id === ticket.id) {
                // It's the same ticket! Close it and go back to feed.
                setActiveMobileView('feed');
                return null;
            }
            // Otherwise, open the newly clicked ticket.
            setActiveMobileView('detail');
            return ticket;
        });
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
        return tickets.filter(t => {
            if (selectedAssigneeId && t.assignedTechnicianId !== selectedAssigneeId) return false;
            if (selectedLabel && t.category !== selectedLabel) return false;
            if (selectedPriority && t.priority !== selectedPriority) return false;
            return true;
        });
    }, [tickets, selectedAssigneeId, selectedLabel, selectedPriority]);

    return (
        <div className="d-flex vh-100 w-100 overflow-hidden position-relative"
             style={{background: 'var(--bs-body-bg)', color: 'var(--bs-body-color)'}}>

            {/* ── THE FLOATING TOGGLE BUTTON ── */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="btn sidebar-toggle-btn d-none d-md-flex align-items-center justify-content-center"
                style={{
                    left: isSidebarOpen ? '227px' : '16px',
                }}
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
                {isSidebarOpen ? (
                    <ChevronLeft size={14} strokeWidth={2.5}/>
                ) : (
                    <ChevronRight size={14} strokeWidth={2.5}/>
                )}
            </button>

            {/* ── PANE 1: MAIN SIDEBAR ── */}
            <div
                className={`border-end ${activeMobileView === 'sidebar' ? 'd-flex w-100' : 'd-none d-md-flex'}`}
                style={{
                    width: isSidebarOpen ? '240px' : '0px', // Animates to 0!
                    flexShrink: 0,
                    borderColor: 'var(--auth-border-color)',
                    transition: 'width 0.2s ease',
                    overflow: 'hidden'
                }}
            >
                {/* Inner wrapper locks the sidebar at 240px so the text doesn't squish while it slides away */}
                <div style={{width: '240px', minWidth: '240px', height: '100%'}}>
                    <Sidebar role={currentUserRole} onOpenCreateModal={() => setIsCreateModalOpen(true)}/>
                </div>
            </div>

            {!showWorkspaceFeed ? (
                /* ── OUTLET WRAPPER WITH PADDING FIX ── */
                <div
                    className={`flex-grow-1 overflow-auto ${activeMobileView === 'sidebar' ? 'd-none d-md-block' : 'd-block'}`}
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        paddingLeft: isSidebarOpen ? '0px' : '48px', // Pushes content right when closed
                        transition: 'padding-left 0.2s ease'
                    }}
                >
                    {outlet}
                </div>
            ) : (
                <>
                    <div
                        className={`d-flex flex-column border-end ${activeMobileView === 'feed' ? 'd-flex w-100' : 'd-none d-md-flex'}`}
                        style={{
                            width: selectedTicket ? '380px' : undefined,
                            flexShrink: selectedTicket ? 0 : undefined,
                            flex: selectedTicket ? undefined : '1',
                            borderColor: 'var(--auth-border-color)',
                            transition: 'width 0.2s ease'
                        }}>
                        {isLoading ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : error ? (
                            <div className="p-3 text-danger text-center">Error: {error}</div>
                        ) : (
                            <TicketFeed tickets={filteredTickets} onSelectTicket={handleSelectTicket}
                                        selectedTicketId={selectedTicket?.id}/>
                        )}
                    </div>

                {/* PANE 3: DETAIL PANEL OR ASSIGNEE SIDEBAR */}
                    <div
                        className={`position-relative h-100 ${
                            activeMobileView === 'detail'
                                ? 'd-flex flex-grow-1'
                                : activeMobileView === 'metrics'
                                    ? 'd-block flex-grow-1'
                                    : selectedTicket
                                        ? 'd-flex flex-grow-1'
                                        : 'd-none d-xl-block' 
                        }`}
                        style={{
                            minWidth: 0,
                            // FIX: Animate to 0px instead of 48px!
                            width: selectedTicket ? undefined : (isAssigneePanelOpen ? '320px' : '0px'),
                            flexShrink: 0,
                            transition: 'width 0.2s ease',
                            zIndex: 10 // Ensures button floats over the middle pane
                        }}
                    >
                        {/* ── THE RIGHT-SIDE FLOATING TOGGLE ── */}
                        {!selectedTicket && (
                            <button
                                onClick={() => setIsAssigneePanelOpen(!isAssigneePanelOpen)}
                                className="btn sidebar-toggle-btn d-none d-xl-flex align-items-center justify-content-center"
                                style={{
                                    position: 'absolute',
                                    left: '-13px', // Exactly half the 26px button to straddle the border!
                                    top: '24px'
                                }}
                                title={isAssigneePanelOpen ? "Hide Assignees" : "Show Assignees"}
                            >
                                {isAssigneePanelOpen ? (
                                    <ChevronRight size={14} strokeWidth={2.5} />
                                ) : (
                                    <ChevronLeft size={14} strokeWidth={2.5} />
                                )}
                            </button>
                        )}

                        {/* ── CLIPPING WRAPPER ── */}
                        {/* This hides the inner content gracefully while the outer div animates to 0px */}
                        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            {selectedTicket ? (
                                <TicketDetailPanel ticket={selectedTicket} onBackToFeed={handleBackToFeed} onTicketUpdated={handleTicketUpdated} />
                            ) : (
                                <div style={{ width: '320px', minWidth: '320px', height: '100%', backgroundColor: 'var(--bs-body-bg)' }}>
                                    <AssigneeSidebar
                                        tickets={tickets}
                                        technicians={technicians}
                                        selectedAssigneeId={selectedAssigneeId}
                                        onSelectAssignee={setSelectedAssigneeId}
                                        selectedLabel={selectedLabel}
                                        onSelectLabel={setSelectedLabel}
                                        selectedPriority={selectedPriority}
                                        onSelectPriority={setSelectedPriority}
                                    />

                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}
                               onTicketCreated={handleTicketCreated}/>
        </div>
    );
}