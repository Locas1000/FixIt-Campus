// src/components/domain/AssigneeSidebar.jsx
import React, { useState, useMemo } from 'react';

const CATEGORIES = ['HVAC', 'Plumbing', 'Electrical', 'Structural', 'IT Infrastructure'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function AssigneeSidebar({
    tickets = [],
    technicians = [],
    selectedAssigneeId, onSelectAssignee,
    selectedLabel, onSelectLabel,
    selectedPriority, onSelectPriority
}) {
    // State to track which tab is open ('assignees', 'labels', 'priority')
    const [activeTab, setActiveTab] = useState('assignees');

    // ─── 1. ASSIGNEE COUNTS ───
    const assignees = useMemo(() => {
        const counts = {};
        technicians.forEach(tech => counts[tech.id] = { id: tech.id, name: tech.name, count: 0 });
        tickets.forEach(ticket => {
            if (ticket.assignedTechnicianId && counts[ticket.assignedTechnicianId]) {
                counts[ticket.assignedTechnicianId].count += 1;
            }
        });
        return Object.values(counts).sort((a, b) => b.count - a.count);
    }, [tickets, technicians]);

    // ─── 2. LABEL COUNTS ───
    const labels = useMemo(() => {
        const counts = {};
        CATEGORIES.forEach(cat => counts[cat] = 0);
        tickets.forEach(ticket => {
            if (ticket.category && counts[ticket.category] !== undefined) {
                counts[ticket.category] += 1;
            }
        });
        return Object.keys(counts).map(key => ({ id: key, name: key, count: counts[key] })).sort((a, b) => b.count - a.count);
    }, [tickets]);

    // ─── 3. PRIORITY COUNTS ───
    const priorities = useMemo(() => {
        const counts = {};
        PRIORITIES.forEach(p => counts[p] = 0);
        tickets.forEach(ticket => {
            if (ticket.priority && counts[ticket.priority] !== undefined) {
                counts[ticket.priority] += 1;
            }
        });
        // Keeping priority in High -> Medium -> Low order rather than sorting by count
        return PRIORITIES.map(p => ({ id: p, name: p, count: counts[p] }));
    }, [tickets]);

    // ─── HELPER: RENDER LIST ITEMS ───
    const renderListItem = (item, isActive, onToggle, avatarChar, colorClass) => (
        <div
            key={item.id}
            onClick={() => onToggle(isActive ? null : item.id)}
            className="d-flex align-items-center justify-content-between p-2 rounded"
            style={{
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--auth-btn-bg)' : 'transparent',
                transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--auth-border-color)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
            <div className="d-flex align-items-center gap-2">
                <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white ${isActive ? colorClass : 'bg-secondary'}`}
                    style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}
                >
                    {avatarChar}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: isActive ? '600' : 'normal', color: isActive ? 'var(--bs-body-color)' : 'var(--bs-secondary-color)' }}>
                    {item.name}
                </div>
            </div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                {item.count}
            </div>
        </div>
    );

    // ─── HELPER: RENDER TABS ───
    const renderTab = (tabId, label) => {
        const isActive = activeTab === tabId;
        return (
            <div
                onClick={() => setActiveTab(tabId)}
                className={`pb-2 ${isActive ? 'fw-semibold border-bottom border-2' : 'text-muted'}`}
                style={{
                    borderColor: isActive ? 'var(--bs-body-color)' : 'transparent',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s, border-color 0.2s'
                }}
            >
                {label}
            </div>
        );
    };

    return (
        <div className="h-100 p-4 border-start d-flex flex-column" style={{ borderColor: 'var(--auth-border-color)', backgroundColor: 'var(--bs-body-bg)' }}>
            {/* Tabs Header */}
            <div className="d-flex gap-3 mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--auth-border-color)' }}>
                {renderTab('assignees', 'Assignees')}
                {renderTab('labels', 'Labels')}
                {renderTab('priority', 'Priority')}
            </div>

            {/* List Content */}
            <div className="d-flex flex-column gap-1 overflow-y-auto custom-scrollbar flex-grow-1">
                {activeTab === 'assignees' && assignees.map(user =>
                    renderListItem(user, selectedAssigneeId === user.id, onSelectAssignee, user.name ? user.name.charAt(0).toUpperCase() : '?', 'bg-primary')
                )}

                {activeTab === 'labels' && labels.map(label =>
                    renderListItem(label, selectedLabel === label.id, onSelectLabel, '#', 'bg-info text-dark')
                )}

                {activeTab === 'priority' && priorities.map(prio => {
                    const color = prio.name === 'High' ? 'bg-danger' : prio.name === 'Medium' ? 'bg-warning text-dark' : 'bg-success';
                    return renderListItem(prio, selectedPriority === prio.id, onSelectPriority, prio.name.charAt(0), color);
                })}
            </div>
        </div>
    );
}