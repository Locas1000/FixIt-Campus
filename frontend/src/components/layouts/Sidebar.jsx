import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
    Search, Edit, Clock, Inbox, Layers,
    Settings, ChevronRight, ChevronDown,
    FolderKanban, Users, AlertCircle
} from 'lucide-react';

export default function Sidebar() {
    // Assuming useAuth provides the user object which contains the role
    const { user } = useAuth();
    const role = user?.role || 'User';

    // UI State for collapsable sections (Linear style)
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
    const [isTeamOpen, setIsTeamOpen] = useState(true);

    // Linear-esque Dark Theme Styles
    const styles = {
        sidebar: {
            width: "240px",
            minHeight: "100vh",
            backgroundColor: "#000000", // Linear pure dark background
            color: "#f4f4f5",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            borderRight: "1px solid #27272A",
            display: "flex",
            flexDirection: "column"
        },
        header: {
            padding: "16px 16px 8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        userAvatar: {
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            backgroundColor: "#5a67d8", // Accent color
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "600",
            color: "#fff"
        },
        iconRow: {
            display: "flex",
            gap: "12px",
            color: "#a1a1aa" // Muted gray
        },
        sectionHeader: {
            display: "flex",
            alignItems: "center",
            padding: "6px 16px",
            fontSize: "12px",
            fontWeight: "500",
            color: "#a1a1aa",
            cursor: "pointer",
            userSelect: "none",
            marginTop: "12px",
        },
        navItem: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 16px",
            color: "#d4d4d8",
            textDecoration: "none",
            transition: "background 0.1s ease, color 0.1s ease",
            margin: "2px 8px",
            borderRadius: "6px",
        },
        activeNavItem: {
            backgroundColor: "#27272A", // Dark gray highlight
            color: "#ffffff",
        },
        icon: {
            color: "#a1a1aa",
        }
    };

    // Helper component for NavLinks to handle the Linear active state styling
    const LinearNavLink = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.activeNavItem : {})
            })}
            onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = "#18181b";
                }
            }}
            onMouseLeave={e => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = "transparent";
                }
            }}
        >
            <Icon size={16} style={styles.icon} />
            <span>{label}</span>
        </NavLink>
    );

    // Get user initials for the avatar box
    const getInitials = (name) => {
        if (!name) return "US";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div style={styles.sidebar}>
            {/* Top Header Controls (Linear Style) */}
            <div style={styles.header}>
                <div style={styles.userAvatar}>
                    {getInitials(user?.name)}
                </div>
                <div style={styles.iconRow}>
                    <Clock size={16} style={{cursor: "pointer"}} />
                    <Search size={16} style={{cursor: "pointer"}} />
                    <Edit size={16} style={{cursor: "pointer", color: "#e4e4e7"}} />
                </div>
            </div>

            <div style={{ flexGrow: 1, paddingTop: "8px" }}>
                {/* Universal Links (All Roles) */}
                <LinearNavLink to="/my-tickets" icon={Inbox} label="My issues" />

                {/* ROLE-BASED RENDERING: Dispatchers & Admins */}
                {(role === 'Dispatcher' || role === 'Admin') && (
                    <>
                        {/* Workspace Section */}
                        <div style={styles.sectionHeader} onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}>
                            Workspace
                            <div style={{marginLeft: "auto"}}>
                                {isWorkspaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                        </div>

                        {isWorkspaceOpen && (
                            <div>
                                <LinearNavLink to="/dashboard" icon={FolderKanban} label="All Tickets" />
                                <LinearNavLink to="/triage" icon={AlertCircle} label="Triage" />
                            </div>
                        )}

                        {/* Teams Section */}
                        <div style={styles.sectionHeader} onClick={() => setIsTeamOpen(!isTeamOpen)}>
                            FixIt Teams
                            <div style={{marginLeft: "auto"}}>
                                {isTeamOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                        </div>

                        {isTeamOpen && (
                            <div>
                                <LinearNavLink to="/team/maintenance" icon={Users} label="Maintenance Crew" />
                                <LinearNavLink to="/team/it" icon={Users} label="IT Support" />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Section */}
            <div style={{ paddingBottom: "16px" }}>
                <LinearNavLink to="/settings" icon={Settings} label="Settings" />

                {/* Small role indicator at the very bottom */}
                <div style={{ padding: "12px 16px 0", fontSize: "11px", color: "#71717a", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: role === 'Admin' ? "#f87171" : "#4ade80" }} />
                    {role} Access
                </div>
            </div>
        </div>
    );
}