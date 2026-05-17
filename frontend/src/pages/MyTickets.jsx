import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { Inbox } from 'lucide-react';

import TicketFeed from '../components/domain/TicketFeed';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';

export default function MyTickets() {
    const { user } = useAuth();
    const role = user?.role || 'User';

    // Role-based tab logic
    const canSeeAssigned = role === 'Technician' || role === 'Dispatcher' || role === 'Admin';

    const [activeTab, setActiveTab] = useState('created'); // 'created' | 'assigned'
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

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

    const displayedTickets = useMemo(() => {
        if (!user) return [];

        if (!canSeeAssigned || activeTab === 'created') {
            return tickets.filter(t => t.creatorId === user.id);
        } else if (activeTab === 'assigned') {
            return tickets.filter(t => t.assignedTechnicianId === user.id);
        }

        return [];
    }, [tickets, activeTab, user, canSeeAssigned]);

    const handleTicketUpdated = useCallback((updatedTicket) => {
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
    }, []);

    const handleSelectTicket = useCallback((ticket) => {
        setSelectedTicket(prev => (prev?.id === ticket.id ? null : ticket));
    }, []);

    return (
        <div className="d-flex w-100 h-100 overflow-hidden" style={{ background: 'var(--bs-body-bg)' }}>

            {/* ── PANE 1: TICKET LIST ── */}
            <div
                className="d-flex flex-column border-end h-100"
                style={{ width: selectedTicket ? '380px' : '100%', flexShrink: 0, borderColor: 'var(--auth-border-color)', transition: 'width 0.2s ease' }}
            >
                {/* Header & Tabs */}
                <div style={{ padding: '24px 20px 0', borderBottom: '1px solid var(--auth-border-color)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: 'var(--bs-body-color)' }}>
                        My issues
                    </h1>

                    {canSeeAssigned ? (
                        <div className="d-flex gap-4">
                            <div
                                onClick={() => { setActiveTab('created'); setSelectedTicket(null); }}
                                className="pb-2"
                                style={{
                                    cursor: 'pointer', fontSize: '0.85rem',
                                    fontWeight: activeTab === 'created' ? '500' : '400',
                                    color: activeTab === 'created' ? 'var(--bs-body-color)' : 'var(--bs-secondary-color)',
                                    borderBottom: activeTab === 'created' ? '2px solid var(--bs-body-color)' : '2px solid transparent',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                Reported by me
                            </div>
                            <div
                                onClick={() => { setActiveTab('assigned'); setSelectedTicket(null); }}
                                className="pb-2"
                                style={{
                                    cursor: 'pointer', fontSize: '0.85rem',
                                    fontWeight: activeTab === 'assigned' ? '500' : '400',
                                    color: activeTab === 'assigned' ? 'var(--bs-body-color)' : 'var(--bs-secondary-color)',
                                    borderBottom: activeTab === 'assigned' ? '2px solid var(--bs-body-color)' : '2px solid transparent',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                Assigned to me
                            </div>
                        </div>
                    ) : (
                        <div className="pb-2" style={{ height: '2px' }}></div>
                    )}
                </div>

                {/* List Feed */}
                <div className="flex-grow-1 overflow-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="d-flex justify-content-center p-5">
                            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                        </div>
                    ) : error ? (
                        <div className="p-3 text-danger text-center" style={{ fontSize: '0.85rem' }}>{error}</div>
                    ) : displayedTickets.length > 0 ? (
                        <TicketFeed
                            tickets={displayedTickets}
                            onSelectTicket={handleSelectTicket}
                            selectedTicketId={selectedTicket?.id}
                        />
                    ) : (
                        <div className="text-center p-5 mt-4 text-muted" style={{ fontSize: '0.85rem' }}>
                            No tickets found.
                        </div>
                    )}
                </div>
            </div>

            {/* ── PANE 2: TICKET DETAILS OR EMPTY STATE ── */}
            <div className={`overflow-hidden h-100 ${selectedTicket ? 'd-flex flex-grow-1' : 'd-none d-md-flex flex-grow-1'}`} style={{ minWidth: 0 }}>
                {selectedTicket ? (
                    <TicketDetailPanel
                        ticket={selectedTicket}
                        onBackToFeed={() => setSelectedTicket(null)}
                        onTicketUpdated={handleTicketUpdated}
                    />
                ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ color: 'var(--bs-secondary-color)' }}>
                        <Inbox size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>No issue selected</p>
                    </div>
                )}
            </div>

        </div>
    );
}