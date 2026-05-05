import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const googleLoginHandler = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                // CRITICAL FIX: Send the access_token instead of idToken
                const res = await axios.post('http://localhost:5000/api/auth/google', {
                    access_token: tokenResponse.access_token
                });

                localStorage.setItem('fixit_token', res.data.token);
                localStorage.setItem('fixit_user', JSON.stringify(res.data.user));

                navigate('/dashboard');
            } catch (err) {
                console.error(err);
                setError("Google authentication failed.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError("Google Login Failed"),
    });

    return (
        <AuthLayout
            title="Log in to FixIt"
            footerText="Don't have an account?"
            footerLinkText="Sign up"
            footerLinkTo="/register"
        >
            {/* YOUR RESTORED CUSTOM BUTTON */}
            <button
                className="btn btn-google w-100 py-2 rounded-1 mb-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => googleLoginHandler()}
                disabled={isLoading}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                </svg>
                Continue with Google
            </button>

            {/* Your Email Form Toggle Logic Remains Exactly the Same */}
            {!showEmailForm ? (
                <>
                    <button
                        className="btn btn-auth-secondary w-100 py-2 rounded-1 mb-2"
                        onClick={() => setShowEmailForm(true)}
                    >
                        Continue with email
                    </button>
                </>
            ) : (
                <form onSubmit={handleLogin} className="mt-3 animate__animated animate__fadeIn">
                    {/* Form content remains exactly as you built it */}
                    {error && <div className="alert alert-danger py-2 small rounded-1 border-0">{error}</div>}

                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control form-control-linear py-2 rounded-1"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control form-control-linear py-2 rounded-1"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-body w-100 py-2 rounded-1 mb-2"
                        style={{ backgroundColor: 'var(--bs-body-color)', color: 'var(--bs-body-bg)' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-link text-muted text-decoration-none w-100 small"
                        onClick={() => setShowEmailForm(false)}
                    >
                        ← Back to all options
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default Login;