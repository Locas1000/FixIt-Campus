export default function Sidebar({ role }) {
    const navLinks = [
        {
            label: "Dashboard",
            href: "#",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                </svg>
            ),
        },
        {
            label: "My Tickets",
            href: "#",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
                </svg>
            ),
        },
        {
            label: "Settings",
            href: "#",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
            ),
        },
    ];

    // Inline styles scoped to this component — no global stylesheet needed
    const styles = {
        sidebar: {
            width: "220px",
            minHeight: "100vh",
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            fontSize: "0.875rem",
            letterSpacing: "-0.01em",
        },
        logo: {
            fontSize: "0.7rem",
            fontWeight: "700",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6b7280",
        },
        navLink: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "7px 10px",
            borderRadius: "6px",
            color: "#374151",
            textDecoration: "none",
            fontWeight: "450",
            transition: "background 0.1s ease, color 0.1s ease",
            lineHeight: "1.4",
        },
        navLinkActive: {
            backgroundColor: "#f3f4f6",
            color: "#111827",
            fontWeight: "550",
        },
        rolePill: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.72rem",
            fontWeight: "550",
            letterSpacing: "0.03em",
            color: "#4b5563",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            padding: "4px 10px",
        },
        dot: {
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#6ee7b7",
            flexShrink: 0,
        },
        divider: {
            height: "1px",
            backgroundColor: "#f0f0f0",
            margin: "4px 0",
        },
    };

    return (
        <div
            className="d-flex flex-column border-end bg-white"
            style={styles.sidebar}
        >
            {/* Top — wordmark / app name */}
            <div className="px-4 pt-4 pb-3 border-bottom">
                <span style={styles.logo}>Dispatch</span>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 px-3 py-3">
                <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                    {navLinks.map(({ label, href, icon }, i) => (
                        <li key={label}>
                            <a
                                href={href}
                                style={{
                                    ...styles.navLink,
                                    ...(i === 0 ? styles.navLinkActive : {}),
                                }}
                                onMouseEnter={e => {
                                    if (i !== 0) {
                                        e.currentTarget.style.backgroundColor = "#f9fafb";
                                        e.currentTarget.style.color = "#111827";
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (i !== 0) {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.color = "#374151";
                                    }
                                }}
                            >
                                <span className="text-secondary" style={{ opacity: i === 0 ? 1 : 0.65 }}>
                                    {icon}
                                </span>
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom — role badge */}
            <div className="px-3 py-3 border-top">
                <div style={styles.rolePill}>
                    <span style={styles.dot} />
                    {role ?? "Unassigned"}
                </div>
            </div>
        </div>
    );
}