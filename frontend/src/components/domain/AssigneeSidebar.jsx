// src/components/domain/AssigneeSidebar.jsx
import React, { useMemo } from 'react';

export default function AssigneeSidebar({ tickets = [], technicians = [], selectedAssigneeId, onSelectAssignee }) {

    const assignees = useMemo(() => {
        const counts = {};

        // 1. Initialize the list with ALL technicians from the API using their ID as the key
        technicians.forEach(tech => {
            counts[tech.id] = {
                id: tech.id,
                name: tech.name,
                count: 0
            };
        });

        // 2. Loop through the tickets and add to their counts based on assignedTechnicianId
        tickets.forEach(ticket => {
            const techId = ticket.assignedTechnicianId;

            // If the ticket has a techId and that ID exists in our technicians list, increment it
            if (techId && counts[techId]) {
                counts[techId].count += 1;
            }
        });

        // Convert to array and sort by count (highest first)
        return Object.values(counts).sort((a, b) => b.count - a.count);
    }, [tickets, technicians]);

    return (
        <div className="h-100 p-4 border-start" style={{ borderColor: 'var(--auth-border-color)' }}>
            {/* Tabs */}
            <div className="d-flex gap-3 mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--auth-border-color)' }}>
                <div className="fw-semibold pb-2 border-bottom border-2" style={{ borderColor: 'var(--bs-body-color)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Assignees
                </div>
                <div className="text-muted pb-2" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Labels</div>
                <div className="text-muted pb-2" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Priority</div>
            </div>

            {/* List */}
            <div className="d-flex flex-column gap-1">
                {assignees.map(user => {
                    // Check if this specific user ID is active
                    const isActive = selectedAssigneeId === user.id;

                    return (
                        <div
                            key={user.id}
                            // When clicked, pass their ID instead of their name
                            onClick={() => onSelectAssignee(isActive ? null : user.id)}
                            className="d-flex align-items-center justify-content-between p-2 rounded"
                            style={{
                                cursor: 'pointer',
                                backgroundColor: isActive ? 'var(--auth-btn-bg)' : 'transparent',
                                transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        fontSize: '0.7rem',
                                        backgroundColor: isActive ? 'var(--bs-primary)' : 'var(--bs-secondary)'
                                    }}
                                >
                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: isActive ? '600' : 'normal' }}>
                                    {user.name}
                                </div>
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                {user.count}
                            </div>
                        </div>
                    );
                })}

                {assignees.length === 0 && (
                    <div className="text-muted text-center mt-3" style={{ fontSize: '0.85rem' }}>
                        No assignees found.
                    </div>
                )}
            </div>
        </div>
    );
}