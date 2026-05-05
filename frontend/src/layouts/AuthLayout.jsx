import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ title, children, footerText, footerLinkText, footerLinkTo }) => {
    return (
        // min-vh-100 ensures the container takes up the full height of the screen
        // d-flex center utilities perfectly center our auth-container
        <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center px-3">
            <div className="auth-container text-center w-100">

                {/* 1. The Logo */}
                <div className="mb-4">
                    {/* Recreating a sleek, Linear-style SVG logo placeholder */}
                    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="24" fill="currentColor" className="text-body" />
                        <path d="M14 24L24 14" stroke="var(--bs-body-bg)" strokeWidth="4" strokeLinecap="round" />
                        <path d="M14 34L34 14" stroke="var(--bs-body-bg)" strokeWidth="4" strokeLinecap="round" />
                        <path d="M24 34L34 24" stroke="var(--bs-body-bg)" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                {/* 2. The Title */}
                <h4 className="fw-semibold mb-4 text-body">
                    {title}
                </h4>

                {/* 3. The Main Content (Buttons, Forms, injected by the parent page) */}
                <div className="d-flex flex-column gap-3 mb-5 text-start w-100">
                    {children}
                </div>

                {/* 4. The Footer Link */}
                <p className="text-muted small mb-0">
                    {footerText}{' '}
                    <Link to={footerLinkTo} className="text-body fw-medium text-decoration-none">
                        {footerLinkText}
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default AuthLayout;