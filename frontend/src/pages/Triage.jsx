// src/pages/Triage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ticketService } from '../services/ticketService';
import { AlertCircle, Inbox } from 'lucide-react';

// Re-using your existing, beautiful domain components!
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

                // TRIAGE LOGIC: Filter for tickets that are 'Open' OR have no assignee
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
        // If the ticket is assigned or status changed from Open, we might want to remove it from Triage!
        if (updatedTicket.status !== 'Open' && updatedTicket.assignedTechnicianId) {
            // Remove it from the queue visually
            setTriageTickets(prev => prev.filter(t => t.id !== updatedTicket.id));
            setSelectedTicket(null); // Clear the right panel
        } else {
            // Otherwise, just update it in place
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
            {/* PANE 1: THE TRIAGE FEED */}
            <div
                className="d-flex flex-column border-end h-100"
                style={{ width: '340px', flexShrink: 0, borderColor: 'var(--auth-border-color)' }}
            >
                {/* Custom Triage Header */}
                <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ borderColor: 'var(--auth-border-color)' }}>
                    <AlertCircle size={16} className="text-warning" />
                    <h6 className="mb-0 fw-semibold">Needs Triage</h6>
                    <span className="badge rounded-pill ms-auto" style={{ backgroundColor: 'var(--auth-btn-bg)', color: 'var(--bs-secondary-color)' }}>
                        {triageTickets.length}
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
                        Loading queue...
                    </div>
                ) : error ? (
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center text-danger p-3 text-center">
                        {error}
                    </div>
                ) : triageTickets.length === 0 ? (
                    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted gap-2">
                        <Inbox size={32} style={{ opacity: 0.5 }} />
                        <span>Triage queue is empty. Great job!</span>
                    </div>
                ) : (
                    // RE-USING YOUR FEED COMPONENT
                    <TicketFeed
                        tickets={triageTickets}
                        onSelectTicket={handleSelectTicket}
                        selectedTicketId={selectedTicket?.id}
                    />
                )}
            </div>

            {/* PANE 2: THE DETAIL PANEL */}
            <div className="flex-grow-1 overflow-hidden d-flex">
                {selectedTicket ? (
                    // RE-USING YOUR DETAIL PANEL COMPONENT
                    <TicketDetailPanel
                        ticket={selectedTicket}
                        onBackToFeed={handleBackToFeed}
                        onTicketUpdated={handleTicketUpdated}
                    />
                ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                        <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p>Select a ticket from the queue to review and assign.</p>
                    </div>
                )}
            </div>

        </div>
    );
}