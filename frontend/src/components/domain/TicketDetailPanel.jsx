// src/components/domain/TicketDetailPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Confirmed', 'Closed', 'Blocked'];

const STATUS_META = {
    'Open':        { icon: '○', color: '#6b7280' },
    'Assigned':    { icon: '◎', color: '#6b7280' },
    'In Progress': { icon: '◑', color: '#F5A623' },
    'Resolved':    { icon: '◕', color: '#8b5cf6' },
    'Confirmed':   { icon: '⬡', color: '#06b6d4' },
    'Closed':      { icon: '●', color: '#7ED321' },
    'Blocked':     { icon: '⊗', color: '#ef4444' },
};

const PRIORITY_META = {
    'High':   { icon: '▲', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    'Medium': { icon: '▬', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    'Low':    { icon: '▼', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Dropdown({ trigger, children, open, onToggle, disabled }) {
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onToggle(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onToggle]);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <div onClick={() => !disabled && onToggle(!open)} style={{ cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.7 : 1 }}>
                {trigger}
            </div>
            {open && !disabled && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 300,
                    background: 'var(--auth-btn-bg)',
                    border: '1px solid var(--auth-border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    minWidth: '160px',
                    padding: '4px 0',
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}

function DropdownItem({ onClick, children, active }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem',
                background: hov || active ? 'var(--auth-border-color)' : 'transparent',
                color: active ? 'var(--bs-body-color)' : 'var(--bs-secondary-color)',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'background 0.1s',
                fontWeight: active ? '600' : '400',
            }}
        >
            {children}
        </div>
    );
}

function PropertyRow({ label, children }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', minHeight: '32px', gap: '8px' }}>
            <span style={{ width: '100px', fontSize: '0.78rem', color: 'var(--bs-secondary-color)', flexShrink: 0 }}>
                {label}
            </span>
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    );
}

function ActivityItem({ item }) {
    const isSystemMessage =
        item.comment === "Status updated via Detail Panel" ||
        (item.comment && String(item.comment).startsWith("Assigned to"));

    const isComment = item.type === 'comment' || (item.comment && !isSystemMessage);

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        if (isNaN(d)) return ts;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const displayName = item.changedByUserName || `User #${item.changedByUserId}`;
    const userInitial = String(displayName).charAt(0).toUpperCase();
    const prevMeta = item.previousStatus ? STATUS_META[item.previousStatus] : null;
    const nextMeta = item.newStatus ? STATUS_META[item.newStatus] : null;

    return (
        <div style={{ display: 'flex', gap: '10px', padding: '10px 0' }}>
            <div style={{
                width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                background: '#3b1d6e', border: '1.5px solid #6d28d9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: '600', color: '#c4b5fd',
            }}>
                {userInitial}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--bs-body-color)' }}>
                        {displayName}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--bs-secondary-color)' }}>
                        {formatTime(item.changedAt)}
                    </span>
                </div>

                <div style={{
                    fontSize: '0.83rem',
                    color: 'var(--bs-secondary-color)',
                    lineHeight: '1.55',
                    wordBreak: 'break-word'
                }}>
                    {isComment ? (
                        <>{item.comment || item.content}</>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            changed status
                            {prevMeta && (
                                <>
                                    {' '}from{' '}
                                    <span style={{
                                        color: prevMeta.color, background: `${prevMeta.color}18`,
                                        padding: '1px 5px', borderRadius: '3px', fontSize: '0.75rem',
                                    }}>
                                        {prevMeta.icon} {item.previousStatus}
                                    </span>
                                </>
                            )}
                            {nextMeta && (
                                <>
                                    {' '}to{' '}
                                    <span style={{
                                        color: nextMeta.color, background: `${nextMeta.color}18`,
                                        padding: '1px 5px', borderRadius: '3px', fontSize: '0.75rem',
                                    }}>
                                        {nextMeta.icon} {item.newStatus}
                                    </span>
                                </>
                            )}
                            {!isSystemMessage && item.comment && (
                                <span style={{ color: 'var(--bs-secondary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                                    — "{item.comment}"
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CommentBox({ onSubmit, isSubmitting }) {
    const [value, setValue] = useState('');
    const [focused, setFocused] = useState(false);

    const handleSubmit = () => {
        if (!value.trim() || isSubmitting) return;
        onSubmit(value.trim());
        setValue('');
    };

    return (
        <div style={{ marginTop: '16px' }}>
            <textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Add a comment or status note..."
                rows={focused || value ? 3 : 2}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--auth-input-bg)',
                    border: `1px solid ${focused ? 'var(--bs-secondary-color)' : 'var(--auth-border-color)'}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'var(--bs-body-color)',
                    fontSize: '0.83rem',
                    lineHeight: '1.55',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                }}
                onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
                }}
            />
            {(focused || value) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--bs-secondary-color)', alignSelf: 'center' }}>
                        ⌘↵ to submit
                    </span>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !value.trim()}
                        className="btn btn-sm"
                        style={{
                            background: '#4c1d95', border: '1px solid #6d28d9',
                            color: '#c4b5fd', fontSize: '0.78rem',
                            borderRadius: '6px', padding: '4px 14px',
                        }}
                    >
                        {isSubmitting ? '...' : 'Comment'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TicketDetailPanel({ ticket: initialTicket, onBackToFeed, onTicketUpdated, isTriageMode = false }) {
    const { user } = useAuth();

    const [ticket, setTicket] = useState(initialTicket);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    const [openDropdown, setOpenDropdown] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    const [isPropertiesOpen, setIsPropertiesOpen] = useState(true); // Desktop right-panel state
    const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false); // Mobile bottom-sheet state

    const [technicians, setTechnicians] = useState([]);
    const [assigneeUpdating, setAssigneeUpdating] = useState(false);

    useEffect(() => {
        setTicket(initialTicket);
        setOpenDropdown(null);
    }, [initialTicket?.id]);

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users?role=Technician', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('fixit_token')}` }
                });
                setTechnicians(res.data);
            } catch (err) {
                console.error("Failed to load technicians", err);
            }
        };
        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (!ticket?.id) return;
        const fetchHistory = async () => {
            setHistoryLoading(true);
            setHistoryError(null);
            try {
                const data = await ticketService.getTicketHistory(ticket.id);
                setHistory(data);
            } catch (err) {
                setHistoryError(err.message);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, [ticket?.id]);

    const toggleDropdown = (name) => (val) => setOpenDropdown(val ? name : null);

    const handleStatusChange = async (newStatus) => {
        setOpenDropdown(null);
        const previousStatus = ticket.status;

        setTicket(prev => ({ ...prev, status: newStatus }));
        setStatusUpdating(true);
        try {
            const updated = await ticketService.updateTicketStatus(
                ticket.id,
                newStatus,
                "Status updated via Detail Panel",
                user?.id ?? 1
            );
            setTicket(updated);
            if (onTicketUpdated) onTicketUpdated(updated);

            const newHistory = await ticketService.getTicketHistory(ticket.id);
            setHistory(newHistory);
        } catch (err) {
            setTicket(prev => ({ ...prev, status: previousStatus }));
            console.error('Failed to update status:', err.message);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleAssigneeChange = async (assigneeId) => {
        setOpenDropdown(null);
        const previousAssignee = ticket.assignedTechnicianId;

        setTicket(prev => ({ ...prev, assignedTechnicianId: assigneeId }));
        setAssigneeUpdating(true);
        try {
            const updated = await ticketService.updateTicketAssignee(
                ticket.id,
                assigneeId,
                user?.id ?? 1
            );
            setTicket(updated);
            if (onTicketUpdated) onTicketUpdated(updated);

            const newHistory = await ticketService.getTicketHistory(ticket.id);
            setHistory(newHistory);
        } catch (err) {
            setTicket(prev => ({ ...prev, assignedTechnicianId: previousAssignee }));
            console.error("Failed to update assignee:", err.message);
        } finally {
            setAssigneeUpdating(false);
        }
    };

    const handleCommentSubmit = async (comment) => {
        setCommentSubmitting(true);
        try {
            await ticketService.updateTicketStatus(
                ticket.id,
                ticket.status,
                comment,
                user?.id ?? 1
            );
            const newHistory = await ticketService.getTicketHistory(ticket.id);
            setHistory(newHistory);
        } catch (err) {
            console.error('Failed to add comment:', err.message);
        } finally {
            setCommentSubmitting(false);
        }
    };

    if (!ticket) return null;

    const statusMeta = STATUS_META[ticket.status] || STATUS_META['Open'];
    const priorityMeta = PRIORITY_META[ticket.priority] || PRIORITY_META['Medium'];
    const assignedTech = technicians.find(t => t.id === ticket.assignedTechnicianId);

    const formattedDate = (ts) => ts
        ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    const creatorName = ticket.creatorId === user?.id ? user?.name : `User #${ticket.creatorId}`;
    const creatorInitial = creatorName ? creatorName.charAt(0).toUpperCase() : '?';

    // ─── EXTRACTED PROPERTIES FOR REUSE IN DESKTOP AND MOBILE ───
    const renderProperties = () => (
        <>
            <PropertyRow label="Status">
                <Dropdown
                    open={openDropdown === 'status-panel'}
                    onToggle={toggleDropdown('status-panel')}
                    // FIX: Remove 'isTriageMode' from the disabled check
                    // Now it only disables if the current user is a 'User'
                    disabled={user?.role === 'User'}
                    trigger={
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '2px 8px', borderRadius: '5px', fontSize: '0.78rem',
                            background: `${statusMeta.color}18`, border: `1px solid ${statusMeta.color}33`,
                            color: statusMeta.color,
                        }}>
                {statusMeta.icon} {ticket.status}
                            {/* Only show the arrow if the user is allowed to edit
                  (i.e., not a 'User')
                */}
                            {user?.role !== 'User' && <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>▾</span>}
            </span>
                    }
                >
                    {VALID_STATUSES.map(s => {
                        const m = STATUS_META[s];
                        return (
                            <DropdownItem key={s} active={s === ticket.status}
                                          onClick={() => { setOpenDropdown(null); handleStatusChange(s); }}>
                                <span style={{ color: m.color }}>{m.icon}</span>{s}
                            </DropdownItem>
                        );
                    })}
                </Dropdown>
            </PropertyRow>


            <PropertyRow label="Priority">
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '2px 8px', borderRadius: '5px', fontSize: '0.78rem',
                    background: priorityMeta.bg, border: `1px solid ${priorityMeta.color}33`,
                    color: priorityMeta.color,
                }}>
                    {priorityMeta.icon} {ticket.priority}
                </span>
            </PropertyRow>

            <PropertyRow label="Assignee">
                <Dropdown
                    open={openDropdown === 'assignee-panel'}
                    onToggle={toggleDropdown('assignee-panel')}
                    disabled={user?.role !== 'Dispatcher'}
                    trigger={
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '2px 8px', borderRadius: '5px', fontSize: '0.78rem',
                            background: 'transparent', border: '1px solid var(--auth-border-color)',
                            color: 'var(--bs-body-color)', opacity: assigneeUpdating ? 0.6 : 1
                        }}>
                            {assigneeUpdating ? (
                                <span className="spinner-border spinner-border-sm text-secondary" style={{ width: '12px', height: '12px' }} />
                            ) : ticket.assignedTechnicianId ? (
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    background: '#3b1d6e', border: '1px solid #6d28d9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.5rem', fontWeight: '600', color: '#c4b5fd',
                                }}>
                                    {String(ticket.assignedTechnicianId).charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <span style={{ color: 'var(--bs-secondary-color)', fontSize: '0.8rem' }}>○</span>
                            )}
                            <span style={{ color: ticket.assignedTechnicianId ? 'inherit' : 'var(--bs-secondary-color)' }}>
                                {assignedTech ? assignedTech.name : 'Unassigned'}
                            </span>
                            {user?.role === 'Dispatcher' && <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>▾</span>}
                        </div>
                    }
                >
                    <DropdownItem active={!ticket.assignedTechnicianId} onClick={() => handleAssigneeChange(null)}>
                        <span style={{ color: 'var(--bs-secondary-color)' }}>○</span> Unassigned
                    </DropdownItem>
                    {technicians.map(tech => (
                        <DropdownItem key={tech.id} active={tech.id === ticket.assignedTechnicianId}
                                      onClick={() => handleAssigneeChange(tech.id)}>
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: '#3b1d6e', border: '1px solid #6d28d9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.5rem', fontWeight: '600', color: '#c4b5fd',
                            }}>
                                {String(tech.name).charAt(0).toUpperCase()}
                            </div>
                            {tech.name} {tech.specialty ? `(${tech.specialty})` : ''}
                        </DropdownItem>
                    ))}
                </Dropdown>
            </PropertyRow>

            <PropertyRow label="Reporter">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#1e3a5f', border: '1.5px solid #2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', fontWeight: '600', color: '#93c5fd',
                    }}>
                        {creatorInitial}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--bs-body-color)' }}>
                        {creatorName}
                    </span>
                </div>
            </PropertyRow>

            {ticket.category && (
                <PropertyRow label="Category">
                    <span style={{ fontSize: '0.78rem', color: 'var(--bs-secondary-color)' }}>
                        {ticket.category}
                    </span>
                </PropertyRow>
            )}

            {ticket.slaDeadline && (
                <PropertyRow label="SLA Due">
                    <span style={{
                        fontSize: '0.78rem',
                        color: new Date(ticket.slaDeadline) < new Date() ? '#ef4444' : 'var(--bs-secondary-color)',
                    }}>
                        {formattedDate(ticket.slaDeadline)}
                    </span>
                </PropertyRow>
            )}

            <hr style={{ borderColor: 'var(--auth-border-color)', margin: '12px 0 8px' }} />

            <div style={{ fontSize: '0.72rem', color: 'var(--bs-secondary-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Created: {formattedDate(ticket.createdAt)}</div>
                <div>Updated: {formattedDate(ticket.updatedAt)}</div>
                <div style={{ marginTop: '4px', fontFamily: 'monospace', color: 'var(--bs-secondary-color)', opacity: 0.5 }}>
                    TKT-{String(ticket.id).substring(0, 4)}
                </div>
            </div>
        </>
    );

    return (
        <div className="d-flex flex-grow-1 w-100 h-100 position-relative overflow-hidden" style={{ background: 'var(--bs-body-bg)' }}>

            {/* ── MAIN CONTENT AREA ── */}
            <div className="flex-grow-1 overflow-y-auto custom-scrollbar p-4 p-lg-5 d-flex" style={{ minWidth: 0 }}>
                <div style={{ width: '100%' }}>

                    {/* GHOST "BACK" BUTTON - Mobile Only */}
                    <div className="mb-4 d-md-none">
                        <button
                            className="btn d-inline-flex align-items-center gap-2 p-0"
                            onClick={onBackToFeed}
                            style={{
                                fontSize: '0.85rem', fontWeight: '500', color: 'var(--bs-secondary-color)',
                                border: 'none', background: 'transparent', transition: 'color 0.15s ease'
                            }}
                        >
                            <ChevronLeft size={16} strokeWidth={2.5} />
                            Back to issues
                        </button>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--bs-secondary-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Issues</span>
                        <span style={{ opacity: 0.4 }}>›</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--bs-secondary-color)' }}>
                            TKT-{String(ticket.id).substring(0, 4)}
                        </span>
                    </div>

                    <h4 className="fw-bold mb-3" style={{ color: 'var(--bs-body-color)', lineHeight: '1.3', fontSize: '1.25rem', wordBreak: 'break-word' }}>
                        {ticket.title}
                    </h4>

                    {/* NEW: MOBILE PROPERTIES TOGGLE */}
                    <button
                        className="btn d-lg-none d-flex align-items-center justify-content-between mb-4 w-100"
                        onClick={() => setIsMobilePropertiesOpen(true)}
                        style={{
                            background: 'transparent', color: 'var(--bs-secondary-color)',
                            border: '1px solid var(--auth-border-color)', borderRadius: '6px',
                            fontSize: '0.85rem', fontWeight: '500', padding: '8px 12px'
                        }}
                    >
                        <span>View Properties</span>
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>

                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <Dropdown
                            open={openDropdown === 'status'}
                            onToggle={toggleDropdown('status')}
                            disabled={isTriageMode || user?.role === 'User'}
                            trigger={
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem',
                                    background: `${statusMeta.color}18`,
                                    border: `1px solid ${statusMeta.color}44`,
                                    color: statusMeta.color,
                                }}>
                                    {statusUpdating ? <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }} /> : statusMeta.icon}
                                    {ticket.status}
                                    {!isTriageMode && <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>▾</span>}
                                </span>
                            }
                        >
                            {VALID_STATUSES.map(s => {
                                const m = STATUS_META[s];
                                return (
                                    <DropdownItem key={s} active={s === ticket.status} onClick={() => handleStatusChange(s)}>
                                        <span style={{ color: m.color }}>{m.icon}</span> {s}
                                    </DropdownItem>
                                );
                            })}
                        </Dropdown>

                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem',
                            background: priorityMeta.bg, border: `1px solid ${priorityMeta.color}44`,
                            color: priorityMeta.color,
                        }}>
                            {priorityMeta.icon} {ticket.priority}
                        </span>

                        {ticket.category && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem',
                                background: 'var(--auth-border-color)', border: '1px solid var(--auth-border-color)',
                                color: 'var(--bs-secondary-color)',
                            }}>
                                {ticket.category}
                            </span>
                        )}
                    </div>

                    {/* RESTORED DESCRIPTION BLOCK */}
                    {ticket.description && (
                        <div
                            className="markdown-container"
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--bs-secondary-color)',
                                lineHeight: '1.7',
                                marginBottom: '28px',
                                overflowWrap: 'break-word'
                            }}
                        >
                            <ReactMarkdown>
                                {ticket.description}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* RESTORED EVIDENCE BLOCK */}
                    {ticket.evidence && ticket.evidence.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bs-secondary-color)', marginBottom: '10px', fontWeight: '600' }}>
                                Evidence
                            </p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {ticket.evidence.map((ev, i) => (
                                    <div key={ev.id || i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--auth-border-color)' }}>
                                        <img
                                            src={ev.url} alt={ev.comment || `Evidence ${i + 1}`}
                                            style={{ width: '160px', height: '100px', objectFit: 'cover', display: 'block' }}
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                        {ev.comment && (
                                            <div style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--bs-secondary-color)', background: 'var(--auth-input-bg)' }}>
                                                {ev.comment}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr style={{ borderColor: 'var(--auth-border-color)', margin: '0 0 20px' }} />

                    {/* RESTORED ACTIVITY FEED BLOCK */}
                    <div>
                        <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bs-secondary-color)', marginBottom: '8px', fontWeight: '600' }}>
                            Activity
                        </p>

                        {historyLoading && <div className="text-muted" style={{ fontSize: '0.8rem', padding: '12px 0' }}>Loading history...</div>}
                        {historyError && <div style={{ fontSize: '0.8rem', color: '#ef4444', padding: '8px 0' }}>{historyError}</div>}

                        {!historyLoading && (
                            <div style={{ display: 'flex', gap: '10px', padding: '5px 0' }}>
                                <div style={{ width: '26px', flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: '2px' }}>
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '50%',
                                        background: '#1e1e2e', border: '1.5px solid var(--auth-border-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.55rem', color: 'var(--bs-secondary-color)',
                                    }}>
                                        {creatorInitial}
                                    </div>
                                </div>
                                <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--bs-secondary-color)', lineHeight: '1.5' }}>
                                    <span style={{ fontWeight: '500', color: 'var(--bs-body-color)' }}>{creatorName}</span> created this ticket
                                    <span style={{ color: '#3a3a48', marginLeft: '8px', fontSize: '0.72rem' }}>
                                        {formattedDate(ticket.createdAt)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {history.map(item => <ActivityItem key={item.id} item={item} />)}

                        <CommentBox onSubmit={handleCommentSubmit} isSubmitting={commentSubmitting} />
                    </div>

                </div>
            </div>

            {/* ── DESKTOP RIGHT PROPERTIES PANEL WRAPPER ── */}
            <div
                className="d-none d-lg-block position-relative h-100"
                style={{
                    width: isPropertiesOpen ? '280px' : '0px',
                    flexShrink: 0, transition: 'width 0.2s ease', zIndex: 10
                }}
            >
                <button
                    onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
                    className="btn sidebar-toggle-btn d-none d-lg-flex align-items-center justify-content-center"
                    style={{
                        position: 'absolute', right: isPropertiesOpen ? '267px' : '16px',
                        top: '24px', zIndex: 1050, transition: 'right 0.2s ease'
                    }}
                >
                    {isPropertiesOpen ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
                </button>

                <div className="d-none d-lg-block h-100" style={{ width: isPropertiesOpen ? '280px' : '0px', flexShrink: 0, transition: 'width 0.2s ease', zIndex: 10 }}>
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderLeft: '1px solid var(--auth-border-color)' }}>
                        <div className="d-flex flex-column py-4 ps-4 pe-5 custom-scrollbar overflow-y-auto" style={{ width: '280px', height: '100%', gap: '2px', backgroundColor: 'var(--bs-body-bg)' }}>
                            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--bs-secondary-color)', fontWeight: '600', marginBottom: '12px' }}>
                                Properties
                            </p>
                            {renderProperties()}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE PROPERTIES BOTTOM SHEET OVERLAY ── */}
            {isMobilePropertiesOpen && (
                <div
                    className="d-lg-none position-fixed w-100 h-100"
                    style={{ top: 0, left: 0, zIndex: 1040, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setIsMobilePropertiesOpen(false)}
                />
            )}
            <div
                className="d-lg-none position-fixed w-100"
                style={{
                    bottom: 0, left: 0,
                    height: isMobilePropertiesOpen ? 'auto' : '0', maxHeight: '85vh',
                    overflowY: 'auto', zIndex: 1050, transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'var(--auth-btn-bg)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
                    borderTop: isMobilePropertiesOpen ? '1px solid var(--auth-border-color)' : 'none',
                    boxShadow: isMobilePropertiesOpen ? '0 -10px 40px rgba(0,0,0,0.5)' : 'none'
                }}
            >
                {isMobilePropertiesOpen && (
                    <div className="p-4 custom-scrollbar">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="mb-0 fw-bold" style={{ color: 'var(--bs-body-color)' }}>Properties</h6>
                            <button
                                onClick={() => setIsMobilePropertiesOpen(false)}
                                className="btn p-0"
                                style={{ color: 'var(--bs-secondary-color)', border: 'none', background: 'transparent' }}
                            >
                                <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>&times;</span>
                            </button>
                        </div>
                        {renderProperties()}
                    </div>
                )}
            </div>

        </div>
    );
}