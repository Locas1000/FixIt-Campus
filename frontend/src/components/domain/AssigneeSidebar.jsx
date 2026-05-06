// src/components/domain/AssigneeSidebar.jsx
import React from 'react';

export default function AssigneeSidebar({ tickets }) {
    // Temporary mock data for assignees based on the image
    const assignees = [
        { id: 'tech-1', name: 'Mathew', email: 'backend@fixit.edu', count: 26 },
        { id: 'tech-2', name: 'Carlo', email: 'frontend@fixit.edu', count: 14 },
        { id: 'tech-3', name: 'Mario', email: 'dbadmin@fixit.edu', count: 8 },
    ];

    return (
        <div className="h-100 p-4 border-start" style={{ borderColor: 'var(--auth-border-color)' }}>
            {/* Tabs */}
            <div className="d-flex gap-3 mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--auth-border-color)' }}>
                <div className="fw-semibold pb-2 border-bottom border-2" style={{ borderColor: 'var(--bs-body-color)', fontSize: '0.85rem' }}>
                    Assignees
                </div>
                <div className="text-muted pb-2" style={{ fontSize: '0.85rem' }}>Labels</div>
                <div className="text-muted pb-2" style={{ fontSize: '0.85rem' }}>Priority</div>
            </div>

            {/* List */}
            <div className="d-flex flex-column gap-3">
                {assignees.map(user => (
                    <div key={user.id} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                {user.name.charAt(0)}
                            </div>
                            <div style={{ fontSize: '0.85rem' }}>{user.name}</div>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{user.count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}