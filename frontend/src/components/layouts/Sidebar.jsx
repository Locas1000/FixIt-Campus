
// src/components/layouts/Sidebar.jsx

import React, { useState } from 'react';

import { NavLink } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';

import {

    Search, Edit, Clock, Inbox,

    Settings, ChevronRight, ChevronDown,

    FolderKanban, Users, AlertCircle

} from 'lucide-react';



// Notice we accept the role AND the function to open the modal as props

export default function Sidebar({ role: propRole, onOpenCreateModal }) {

    const { user } = useAuth();



    // Fallback logic: Prop -> User Context -> 'User'

    const role = propRole || user?.role || 'User';



    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

    const [isTeamOpen, setIsTeamOpen] = useState(true);



    const styles = {

        sidebar: {

            width: "240px",

            minHeight: "100vh",

            backgroundColor: "var(--bs-body-bg)", // Updated

            color: "var(--bs-body-color)", // Updated

            fontFamily: "'Inter', sans-serif",

            fontSize: "14px",

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

            backgroundColor: "#5a67d8", // Keep as a distinct accent color

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            fontSize: "11px",

            fontWeight: "600",

            color: "#fff"

        },

        iconRow: { display: "flex", gap: "12px", color: "var(--bs-secondary-color)" }, // Updated

        sectionHeader: {

            display: "flex", alignItems: "center", padding: "6px 16px",

            fontSize: "12px", fontWeight: "500", color: "var(--bs-secondary-color)", // Updated

            cursor: "pointer", userSelect: "none", marginTop: "12px",

        },

        navItem: {

            display: "flex", alignItems: "center", gap: "10px", padding: "6px 16px",

            color: "var(--bs-body-color)", // Updated

            textDecoration: "none", transition: "background 0.1s ease, color 0.1s ease",

            margin: "2px 8px", borderRadius: "6px",

        },

        activeNavItem: { backgroundColor: "var(--auth-btn-bg)", color: "var(--bs-body-color)" }, // Updated

        icon: { color: "var(--bs-secondary-color)" } // Updated

    };



    const LinearNavLink = ({ to, icon: Icon, label }) => (

        <NavLink

            to={to}

            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.activeNavItem : {}) })}

            onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.backgroundColor = "var(--auth-btn-bg)"; }} // Updated

            onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.backgroundColor = "transparent"; }}

        >

            <Icon size={16} style={styles.icon} />

            <span>{label}</span>

        </NavLink>

    );



    const getInitials = (name) => {

        if (!name) return "US";

        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    };



    // NO FRAGMENTS. Just a clean div.

    return (

        <div style={styles.sidebar} className="w-100 h-100">

            <div style={styles.header}>

                <div style={styles.userAvatar}>

                    {getInitials(user?.name)}

                </div>

                <div style={styles.iconRow}>

                    <Clock size={16} style={{cursor: "pointer"}} />

                    <Search size={16} style={{cursor: "pointer"}} />

                    {/* Fire the prop function when clicked */}

                    <Edit

                        size={16}

                        style={{cursor: "pointer", color: "var(--bs-body-color)"}} // Updated

                        onClick={onOpenCreateModal}

                        title="Create new issue"

                    />

                </div>

            </div>



            <div style={{ flexGrow: 1, paddingTop: "8px" }}>

                <LinearNavLink to="/my-tickets" icon={Inbox} label="My issues" />



                {(role === 'Dispatcher' || role === 'Admin') && (

                    <>

                        <div style={styles.sectionHeader} onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}>

                            Workspace

                            <div style={{marginLeft: "auto"}}>{isWorkspaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</div>

                        </div>

                        {isWorkspaceOpen && (

                            <div>

                                <LinearNavLink to="/dashboard" icon={FolderKanban} label="All Tickets" />

                                <LinearNavLink to="/triage" icon={AlertCircle} label="Triage" />

                            </div>

                        )}



                        <div style={styles.sectionHeader} onClick={() => setIsTeamOpen(!isTeamOpen)}>

                            FixIt Teams

                            <div style={{marginLeft: "auto"}}>{isTeamOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</div>

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



            <div style={{ paddingBottom: "16px" }}>

                <LinearNavLink to="/settings" icon={Settings} label="Settings" />

                <div style={{ padding: "12px 16px 0", fontSize: "11px", color: "var(--bs-secondary-color)", display: "flex", alignItems: "center", gap: "6px" }}>

                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: role === 'Admin' ? "#f87171" : "#4ade80" }} />

                    {role} Access

                </div>

            </div>

        </div>

    );

}