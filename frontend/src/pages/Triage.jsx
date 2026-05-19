// src/pages/Triage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../services/ticketService';
import { AlertCircle, Inbox } from 'lucide-react';

import TicketFeed from '../components/domain/TicketFeed';
import TicketDetailPanel from '../components/domain/TicketDetailPanel';

export default function Triage() {
    const [triageTickets, setTriageTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        const fetchTriageTickets = async () => {
            try {
                setIsLoading(true);
                const allTickets = await ticketService.getTickets();
                const needsTriage = allTickets.filter(
                    (t) => t.status === 'Open' || !t.assignedTechnicianId
                );
                setTriageTickets(needsTriage);
            } catch (err) {
                setError(err.message || 'Failed to load triage queue.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTriageTickets();
    }, []);

    const handleSelectTicket = useCallback((ticket) => {
        setSelectedTicket(ticket);
    }, []);

    const handleTicketUpdated = useCallback((updatedTicket) => {
        if (updatedTicket.status !== 'Open' && updatedTicket.assignedTechnicianId) {
            setTriageTickets(prev => prev.filter(t => t.id !== updatedTicket.id));
            setSelectedTicket(null);
        } else {
            setTriageTickets(prev =>
                prev.map(t => t.id === updatedTicket.id ? updatedTicket : t)
            );
            setSelectedTicket(updatedTicket);
        }
    }, []);

    const handleBackToFeed = () => {
        setSelectedTicket(null);
    };

    return (
        <div className="d-flex h-100 w-100 overflow-hidden" style={{ background: 'var(--bs-body-bg)', color: 'var(--bs-body-color)' }}>

            {/* PANE 1: THE TRIAGE FEED (Responsive: Hide on mobile when ticket is selected) */}
            <div
                className={`flex-column border-end h-100 ${selectedTicket ? 'd-none d-md-flex' : 'd-flex w-100'}`}
                style={{ width: '340px', flexShrink: 0, borderColor: 'var(--auth-border-color)' }}
            >
                <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: 'var(--auth-border-color)' }}>
                    <AlertCircle size={16} className="text-warning" />
                    <h6 className="mb-0 fw-semibold">Needs Triage</h6>
                    <span className="badge rounded-pill ms-auto" style={{ backgroundColor: 'var(--auth-btn-bg)', color: 'var(--bs-secondary-color)' }}>
                        {triageTickets.length}
                    </span>
                </div>

                <div className="flex-grow-1 overflow-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="d-flex align-items-center justify-content-center p-5 text-muted">Loading...</div>
                    ) : error ? (
                        <div className="p-3 text-danger text-center">{error}</div>
                    ) : triageTickets.length === 0 ? (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted p-5 gap-2">
                            <Inbox size={32} style={{ opacity: 0.5 }} />
                            <span>Triage queue is empty.</span>
                        </div>
                    ) : (
                        <TicketFeed
                            tickets={triageTickets}
                            onSelectTicket={handleSelectTicket}
                            selectedTicketId={selectedTicket?.id}
                        />
                    )}
                </div>
            </div>

            {/* PANE 2: THE DETAIL PANEL (Responsive: Full-width on mobile when selected) */}
            <div className={`overflow-hidden h-100 flex-grow-1 ${selectedTicket ? 'd-flex' : 'd-none d-md-flex'}`}>
                {selectedTicket ? (
                    <TicketDetailPanel
                        ticket={selectedTicket}
                        onBackToFeed={handleBackToFeed}
                        onTicketUpdated={handleTicketUpdated}
                        isTriageMode={true}
                    />
                ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                        <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p style={{ fontSize: '0.85rem' }}>Select a ticket to triage.</p>
                    </div>
                )}
            </div>

        </div>
    );
}