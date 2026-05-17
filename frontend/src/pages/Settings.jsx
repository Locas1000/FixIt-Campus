import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User } from 'lucide-react';

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Initialize theme from local storage, default to dark
    const [theme, setTheme] = useState(localStorage.getItem('fixit_theme') || 'dark');

    // Make sure the DOM matches the state when the component mounts
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('fixit_theme', newTheme);
        document.documentElement.setAttribute('data-bs-theme', newTheme);
    };

    const handleLogout = () => {
        // If your AuthContext has a dedicated logout function, call it.
        // Otherwise, manually clear the token and redirect.
        if (typeof logout === 'function') {
            logout();
        } else {
            localStorage.removeItem('fixit_token');
            localStorage.removeItem('fixit_user');
        }
        navigate('/login');
    };

    return (
        <div className="w-100 h-100 d-flex justify-content-center custom-scrollbar overflow-y-auto p-4 p-lg-5" style={{ background: 'var(--bs-body-bg)' }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>

                <h3 className="fw-bold mb-4" style={{ color: 'var(--bs-body-color)' }}>Settings</h3>

                {/* ── APPEARANCE SECTION ── */}
                <div className="mb-5">
                    <p style={{
                        fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--bs-secondary-color)', marginBottom: '12px', fontWeight: '600'
                    }}>
                        Appearance
                    </p>
                    <div style={{
                        background: 'var(--auth-input-bg)', border: '1px solid var(--auth-border-color)',
                        borderRadius: '8px', padding: '16px'
                    }}>
                        <div className="d-flex gap-3">
                            {/* Light Mode Button */}
                            <button
                                onClick={() => handleThemeChange('light')}
                                className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                                style={{
                                    background: theme === 'light' ? 'var(--auth-border-color)' : 'transparent',
                                    border: `1px solid ${theme === 'light' ? 'var(--bs-body-color)' : 'var(--auth-border-color)'}`,
                                    color: 'var(--bs-body-color)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Sun size={18} /> Light
                            </button>

                            {/* Dark Mode Button */}
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                                style={{
                                    background: theme === 'dark' ? 'var(--auth-border-color)' : 'transparent',
                                    border: `1px solid ${theme === 'dark' ? 'var(--bs-body-color)' : 'var(--auth-border-color)'}`,
                                    color: 'var(--bs-body-color)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Moon size={18} /> Dark
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── ACCOUNT SECTION ── */}
                <div>
                    <p style={{
                        fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--bs-secondary-color)', marginBottom: '12px', fontWeight: '600'
                    }}>
                        Account
                    </p>
                    <div style={{
                        background: 'var(--auth-input-bg)', border: '1px solid var(--auth-border-color)',
                        borderRadius: '8px', overflow: 'hidden'
                    }}>

                        {/* User Info Row */}
                        <div className="d-flex align-items-center p-3 border-bottom" style={{ borderColor: 'var(--auth-border-color) !important' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: '#3b1d6e', border: '1.5px solid #6d28d9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '600', color: '#c4b5fd', marginRight: '12px'
                            }}>
                                {user?.name ? String(user.name).charAt(0).toUpperCase() : <User size={18} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '500', color: 'var(--bs-body-color)', fontSize: '0.9rem' }}>
                                    {user?.name || `User #${user?.id || 'Unknown'}`}
                                </div>
                                <div style={{ color: 'var(--bs-secondary-color)', fontSize: '0.8rem' }}>
                                    {user?.role || 'Role not specified'}
                                </div>
                            </div>
                        </div>

                        {/* Logout Button Row */}
                        <div
                            onClick={handleLogout}
                            className="p-3 d-flex align-items-center gap-2"
                            style={{
                                cursor: 'pointer', color: '#ef4444',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <LogOut size={18} />
                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Log out of FixIt Campus</span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}