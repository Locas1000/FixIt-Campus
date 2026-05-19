// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutlet, useLocation, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layouts/Sidebar';
import TicketFeed from '../components/domain/TicketFeed';
import AssigneeSidebar from '../components/domain/AssigneeSidebar';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';
import CreateTicketModal from '../components/domain/CreateTicketModal';

export default function Dashboard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);

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

    // Default sidebar to closed on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    const currentUserRole = user?.role || 'User';
    const showWorkspaceFeed = location.pathname === '/dashboard';
    const navigate = useNavigate();

    // Handle screen resizing for the sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── SECURITY LOGIC ──
    const isAuthorizedForDashboard = ['Dispatcher', 'Admin'].includes(currentUserRole);

    useEffect(() => {
        if (showWorkspaceFeed && !isAuthorizedForDashboard) {
            navigate('/my-tickets', { replace: true });
        }
    }, [showWorkspaceFeed, isAuthorizedForDashboard, navigate]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('fixit_theme') || 'dark';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [ticketsData, techsData] = await Promise.all([
                    ticketService.getTickets(),
                    userService.getUsersByRole('Technician')
                ]);
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
            if (prevTicket && prevTicket.id === ticket.id) {
                setActiveMobileView('feed');
                return null;
            }
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
        // Optional: auto-close sidebar on mobile after creating ticket
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    }, []);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            if (selectedAssigneeId && t.assignedTechnicianId !== selectedAssigneeId) return false;
            if (selectedLabel && t.category !== selectedLabel) return false;
            if (selectedPriority && t.priority !== selectedPriority) return false;
            return true;
        });
    }, [tickets, selectedAssigneeId, selectedLabel, selectedPriority]);

    // Check if we are currently on a mobile viewport
    const isMobile = window.innerWidth < 768;

    return (
        <div className="d-flex vh-100 w-100 overflow-hidden position-relative"
             style={{background: 'var(--bs-body-bg)', color: 'var(--bs-body-color)'}}>

            {/* ── THE FLOATING TOGGLE BUTTON (Now visible on mobile!) ── */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="btn sidebar-toggle-btn d-flex align-items-center justify-content-center"
                style={{
                    position: 'absolute',
                    left: isSidebarOpen ? '227px' : '16px',
                    top: '24px',
                    zIndex: 1060, // High z-index so it stays above the overlay
                    transition: 'left 0.2s ease'
                }}
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
                {isSidebarOpen ? <ChevronLeft size={14} strokeWidth={2.5}/> : <ChevronRight size={14} strokeWidth={2.5}/>}
            </button>

            {/* ── MOBILE SIDEBAR BACKDROP OVERLAY ── */}
            {isSidebarOpen && isMobile && (
                <div
                    className="position-fixed w-100 h-100"
                    style={{ top: 0, left: 0, zIndex: 1040, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── PANE 1: MAIN SIDEBAR ── */}
            <div
                className={`border-end h-100 ${isSidebarOpen ? 'd-flex' : 'd-none d-md-flex'}`}
                style={{
                    position: isMobile ? 'absolute' : 'relative',
                    left: 0,
                    top: 0,
                    zIndex: 1050,
                    backgroundColor: 'var(--bs-body-bg)',
                    width: isSidebarOpen ? '240px' : '0px',
                    flexShrink: 0,
                    borderColor: 'var(--auth-border-color)',
                    transition: 'width 0.2s ease',
                    overflow: 'hidden'
                }}
            >
                <div style={{width: '240px', minWidth: '240px', height: '100%'}}>
                    <Sidebar role={currentUserRole} onOpenCreateModal={() => setIsCreateModalOpen(true)}/>
                </div>
            </div>

            {!showWorkspaceFeed ? (
                /* ── OUTLET WRAPPER ── */
                <div
                    className={`flex-grow-1 overflow-auto ${activeMobileView === 'sidebar' ? 'd-none d-md-block' : 'd-block'}`}
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        // Remove padding shift on mobile to prevent layout jumping
                        paddingLeft: isMobile ? '0px' : (isSidebarOpen ? '0px' : '48px'),
                        transition: 'padding-left 0.2s ease'
                    }}
                >
                    {outlet}
                </div>
            ) : !isAuthorizedForDashboard ? (
                /* ── RENDER BLOCKER TO PREVENT UNAUTHORIZED FLASH ── */
                <div className="flex-grow-1" style={{ backgroundColor: 'var(--bs-body-bg)' }} />
            ) : (
                /* ── WORKSPACE DASHBOARD FEED ── */
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
                            width: selectedTicket ? undefined : (isAssigneePanelOpen ? '320px' : '0px'),
                            flexShrink: 0,
                            transition: 'width 0.2s ease',
                            zIndex: 10
                        }}
                    >
                        {!selectedTicket && (
                            <button
                                onClick={() => setIsAssigneePanelOpen(!isAssigneePanelOpen)}
                                className="btn sidebar-toggle-btn d-none d-xl-flex align-items-center justify-content-center"
                                style={{
                                    position: 'absolute',
                                    left: '-13px',
                                    top: '24px'
                                }}
                                title={isAssigneePanelOpen ? "Hide Assignees" : "Show Assignees"}
                            >
                                {isAssigneePanelOpen ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
                            </button>
                        )}

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