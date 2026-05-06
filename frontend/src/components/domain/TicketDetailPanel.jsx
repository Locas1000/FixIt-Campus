// src/components/domain/TicketDetailPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

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

/**
 * A generic dropdown wrapper that closes on outside click.
 */
function Dropdown({ trigger, children, open, onToggle }) {
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
            <div onClick={() => onToggle(!open)} style={{ cursor: 'pointer' }}>{trigger}</div>
            {open && (
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

/**
 * A single property row in the right panel.
 */
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

/**
 * Renders a single activity entry — either a status-change audit item
 * or a free-text comment.
 */
function ActivityItem({ item }) {
    const isComment = item.type === 'comment' || (!item.previousStatus && !item.newStatus && item.comment);

    // Format a relative or absolute timestamp
    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        if (isNaN(d)) return ts;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const userInitial = item.changedByUserId ? String(item.changedByUserId).charAt(0).toUpperCase() : '?';

    if (isComment) {
        return (
            <div style={{ display: 'flex', gap: '10px', padding: '10px 0' }}>
                {/* Avatar */}
                <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    background: '#3b1d6e', border: '1.5px solid #6d28d9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: '600', color: '#c4b5fd',
                }}>
                    {userInitial}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--bs-body-color)' }}>
                            User #{item.changedByUserId}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--bs-secondary-color)' }}>
                            {formatTime(item.changedAt)}
                        </span>
                    </div>
                    <div style={{
                        background: 'var(--auth-input-bg)',
                        border: '1px solid var(--auth-border-color)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.83rem',
                        color: 'var(--bs-secondary-color)',
                        lineHeight: '1.55',
                    }}>
                        {item.comment || item.content}
                    </div>
                </div>
            </div>
        );
    }

    // Status change item
    const prevMeta = item.previousStatus ? STATUS_META[item.previousStatus] : null;
    const nextMeta = item.newStatus ? STATUS_META[item.newStatus] : null;

    return (
        <div style={{ display: 'flex', gap: '10px', padding: '5px 0', alignItems: 'flex-start' }}>
            <div style={{ width: '26px', flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: '2px' }}>
                <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#1e1e2e', border: '1.5px solid var(--auth-border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: '600', color: 'var(--bs-secondary-color)',
                }}>
                    {userInitial}
                </div>
            </div>
            <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--bs-secondary-color)', lineHeight: '1.5' }}>
                <span style={{ fontWeight: '500', color: 'var(--bs-body-color)' }}>User #{item.changedByUserId}</span>
                {' '}changed status
                {prevMeta && (
                    <>
                        {' '}from{' '}
                        <span style={{
                            color: prevMeta.color,
                            background: `${prevMeta.color}18`,
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
                            color: nextMeta.color,
                            background: `${nextMeta.color}18`,
                            padding: '1px 5px', borderRadius: '3px', fontSize: '0.75rem',
                        }}>
                            {nextMeta.icon} {item.newStatus}
                        </span>
                    </>
                )}
                {item.comment && (
                    <span style={{ color: 'var(--bs-secondary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                        — "{item.comment}"
                    </span>
                )}
                <span style={{ color: '#3a3a48', marginLeft: '8px', fontSize: '0.72rem' }}>
                    {formatTime(item.changedAt)}
                </span>
            </div>
        </div>
    );
}

/**
 * The comment input box at the bottom of the activity feed.
 */
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
                            background: '#4c1d95',
                            border: '1px solid #6d28d9',
                            color: '#c4b5fd',
                            fontSize: '0.78rem',
                            borderRadius: '6px',
                            padding: '4px 14px',
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

export default function TicketDetailPanel({ ticket: initialTicket, onBackToFeed, onTicketUpdated }) {
    const { user } = useAuth();

    // Local ticket state for optimistic updates
    const [ticket, setTicket] = useState(initialTicket);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    const [openDropdown, setOpenDropdown] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    // Sync when a different ticket is selected
    useEffect(() => {
        setTicket(initialTicket);
        setOpenDropdown(null);
    }, [initialTicket?.id]);

    // Fetch audit history whenever the ticket changes
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

    // ── Status Update ──
    const handleStatusChange = async (newStatus) => {
        setOpenDropdown(null);
        const previousStatus = ticket.status;

        // Optimistic update
        setTicket(prev => ({ ...prev, status: newStatus }));

        setStatusUpdating(true);
        try {
            const updated = await ticketService.updateTicketStatus(
                ticket.id,
                newStatus,
                null,
                user?.id ?? 1  // fallback for demo
            );
            setTicket(updated);
            if (onTicketUpdated) onTicketUpdated(updated);

            // Refresh history to show the new audit entry
            const newHistory = await ticketService.getTicketHistory(ticket.id);
            setHistory(newHistory);
        } catch (err) {
            // Roll back on error
            setTicket(prev => ({ ...prev, status: previousStatus }));
            console.error('Failed to update status:', err.message);
        } finally {
            setStatusUpdating(false);
        }
    };

    // ── Comment Submit ──
    const handleCommentSubmit = async (comment) => {
        setCommentSubmitting(true);
        try {
            // Submit as a status-update call with a comment and the current status
            await ticketService.updateTicketStatus(
                ticket.id,
                ticket.status,  // same status — we're just adding a comment
                comment,
                user?.id ?? 1
            );
            // Refresh history
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

    const formattedDate = (ts) => ts
        ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    // ── Render ──
    return (
        <div className="d-flex h-100 overflow-hidden" style={{ background: 'var(--bs-body-bg)' }}>

            {/* ── MAIN CONTENT AREA ── */}
            <div className="flex-grow-1 overflow-y-auto custom-scrollbar p-4" style={{ minWidth: 0 }}>

                {/* Mobile back button */}
                <button
                    className="btn btn-outline-secondary btn-sm mb-3 d-md-none"
                    onClick={onBackToFeed}
                >
                    ← Back to Feed
                </button>

                {/* Breadcrumb */}
                <div style={{ fontSize: '0.75rem', color: 'var(--bs-secondary-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Issues</span>
                    <span style={{ opacity: 0.4 }}>›</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--bs-secondary-color)' }}>
                        TKT-{String(ticket.id).substring(0, 4)}
                    </span>
                </div>

                {/* Title */}
                <h4 className="fw-bold mb-3" style={{ color: 'var(--bs-body-color)', lineHeight: '1.3', fontSize: '1.25rem' }}>
                    {ticket.title}
                </h4>

                {/* Status + Priority pills */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                    <Dropdown
                        open={openDropdown === 'status'}
                        onToggle={toggleDropdown('status')}
                        trigger={
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem',
                                background: `${statusMeta.color}18`,
                                border: `1px solid ${statusMeta.color}44`,
                                color: statusMeta.color,
                                cursor: 'pointer',
                                opacity: statusUpdating ? 0.6 : 1,
                            }}>
                                {statusUpdating
                                    ? <span className="spinner-border spinner-border-sm" style={{ width: '10px', height: '10px' }} />
                                    : statusMeta.icon
                                }
                                {ticket.status}
                                <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>▾</span>
                            </span>
                        }
                    >
                        {VALID_STATUSES.map(s => {
                            const m = STATUS_META[s];
                            return (
                                <DropdownItem key={s} active={s === ticket.status}
                                    onClick={() => handleStatusChange(s)}>
                                    <span style={{ color: m.color }}>{m.icon}</span>
                                    {s}
                                </DropdownItem>
                            );
                        })}
                    </Dropdown>

                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem',
                        background: priorityMeta.bg,
                        border: `1px solid ${priorityMeta.color}44`,
                        color: priorityMeta.color,
                    }}>
                        {priorityMeta.icon} {ticket.priority}
                    </span>

                    {ticket.category && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem',
                            background: 'var(--auth-border-color)',
                            border: '1px solid var(--auth-border-color)',
                            color: 'var(--bs-secondary-color)',
                        }}>
                            {ticket.category}
                        </span>
                    )}
                </div>

                {/* Description */}
                {ticket.description && (
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--bs-secondary-color)',
                        lineHeight: '1.7',
                        marginBottom: '28px',
                        padding: '16px',
                        background: 'var(--auth-input-bg)',
                        border: '1px solid var(--auth-border-color)',
                        borderRadius: '8px',
                    }}>
                        {ticket.description}
                    </div>
                )}

                {/* Evidence / Images */}
                {ticket.evidence && ticket.evidence.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                        <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bs-secondary-color)', marginBottom: '10px', fontWeight: '600' }}>
                            Evidence
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {ticket.evidence.map((ev, i) => (
                                <div key={ev.id || i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--auth-border-color)' }}>
                                    <img
                                        src={ev.url}
                                        alt={ev.comment || `Evidence ${i + 1}`}
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

                {/* Divider */}
                <hr style={{ borderColor: 'var(--auth-border-color)', margin: '0 0 20px' }} />

                {/* Activity Feed */}
                <div>
                    <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--bs-secondary-color)', marginBottom: '8px', fontWeight: '600' }}>
                        Activity
                    </p>

                    {historyLoading && (
                        <div className="text-muted" style={{ fontSize: '0.8rem', padding: '12px 0' }}>
                            Loading history...
                        </div>
                    )}
                    {historyError && (
                        <div style={{ fontSize: '0.8rem', color: '#ef4444', padding: '8px 0' }}>
                            {historyError}
                        </div>
                    )}

                    {/* Ticket creation entry — always shown */}
                    {!historyLoading && (
                        <div style={{ display: 'flex', gap: '10px', padding: '5px 0' }}>
                            <div style={{ width: '26px', flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: '2px' }}>
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    background: '#1e1e2e', border: '1.5px solid var(--auth-border-color)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.55rem', color: 'var(--bs-secondary-color)',
                                }}>
                                    {String(ticket.creatorId ?? '?').charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--bs-secondary-color)', lineHeight: '1.5' }}>
                                <span style={{ fontWeight: '500', color: 'var(--bs-body-color)' }}>User #{ticket.creatorId}</span>
                                {' '}created this ticket
                                <span style={{ color: '#3a3a48', marginLeft: '8px', fontSize: '0.72rem' }}>
                                    {formattedDate(ticket.createdAt)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Audit trail entries */}
                    {history.map(item => (
                        <ActivityItem key={item.id} item={item} />
                    ))}

                    {/* Comment input */}
                    <CommentBox onSubmit={handleCommentSubmit} isSubmitting={commentSubmitting} />
                </div>
            </div>

            {/* ── RIGHT PROPERTIES PANEL ── */}
            <div
                className="d-none d-lg-flex flex-column border-start p-3 custom-scrollbar overflow-y-auto"
                style={{
                    width: '220px',
                    flexShrink: 0,
                    borderColor: 'var(--auth-border-color)',
                    gap: '2px',
                }}
            >
                <p style={{
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--bs-secondary-color)', fontWeight: '600', marginBottom: '12px',
                }}>
                    Properties
                </p>

                {/* Status */}
                <PropertyRow label="Status">
                    <Dropdown
                        open={openDropdown === 'status-panel'}
                        onToggle={toggleDropdown('status-panel')}
                        trigger={
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '2px 8px', borderRadius: '5px', fontSize: '0.78rem',
                                background: `${statusMeta.color}18`,
                                border: `1px solid ${statusMeta.color}33`,
                                color: statusMeta.color, cursor: 'pointer',
                            }}>
                                {statusMeta.icon} {ticket.status}
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

                {/* Priority */}
                <PropertyRow label="Priority">
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '2px 8px', borderRadius: '5px', fontSize: '0.78rem',
                        background: priorityMeta.bg,
                        border: `1px solid ${priorityMeta.color}33`,
                        color: priorityMeta.color,
                    }}>
                        {priorityMeta.icon} {ticket.priority}
                    </span>
                </PropertyRow>

                {/* Assignee */}
                <PropertyRow label="Assignee">
                    {ticket.assignedTechnicianId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: '#3b1d6e', border: '1.5px solid #6d28d9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6rem', fontWeight: '600', color: '#c4b5fd',
                            }}>
                                {String(ticket.assignedTechnicianId).charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--bs-body-color)' }}>
                                #{ticket.assignedTechnicianId}
                            </span>
                        </div>
                    ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--bs-secondary-color)', opacity: 0.5 }}>
                            Unassigned
                        </span>
                    )}
                </PropertyRow>

                {/* Reporter */}
                <PropertyRow label="Reporter">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: '#1e3a5f', border: '1.5px solid #2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: '600', color: '#93c5fd',
                        }}>
                            {String(ticket.creatorId ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--bs-body-color)' }}>
                            #{ticket.creatorId}
                        </span>
                    </div>
                </PropertyRow>

                {/* Category */}
                {ticket.category && (
                    <PropertyRow label="Category">
                        <span style={{ fontSize: '0.78rem', color: 'var(--bs-secondary-color)' }}>
                            {ticket.category}
                        </span>
                    </PropertyRow>
                )}

                {/* SLA Deadline */}
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

                {/* Divider */}
                <hr style={{ borderColor: 'var(--auth-border-color)', margin: '12px 0 8px' }} />

                {/* Timestamps */}
                <div style={{ fontSize: '0.72rem', color: 'var(--bs-secondary-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Created: {formattedDate(ticket.createdAt)}</div>
                    <div>Updated: {formattedDate(ticket.updatedAt)}</div>
                    <div style={{ marginTop: '4px', fontFamily: 'monospace', color: 'var(--bs-secondary-color)', opacity: 0.5 }}>
                        TKT-{String(ticket.id).substring(0, 4)}
                    </div>
                </div>
            </div>
        </div>
    );
}
