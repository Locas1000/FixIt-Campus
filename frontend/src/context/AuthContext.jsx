/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';
import authService from '../services/auth.service';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
    // Lazy initialize state directly from localStorage to prevent double-renders
    const [token, setToken] = useState(() => localStorage.getItem('fixit_token'));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('fixit_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Because we grabbed the data synchronously on load, we don't need a loading phase
    const [loading, setLoading] = useState(false);

    // Wrapper for the login service that handles state and storage
    const login = async (email, password) => {
        const data = await authService.login(email, password);

        setToken(data.token);
        setUser(data.user);

        localStorage.setItem('fixit_token', data.token);
        localStorage.setItem('fixit_user', JSON.stringify(data.user));

        return data;
    };

    // Wrapper for the register service
    const register = async (name, email, password, role) => {
        const data = await authService.register(name, email, password, role);

        setToken(data.token);
        setUser(data.user);

        localStorage.setItem('fixit_token', data.token);
        localStorage.setItem('fixit_user', JSON.stringify(data.user));

        return data;
    };

    // Clears state and local storage
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('fixit_token');
        localStorage.removeItem('fixit_user');
    };

    // The context payload that will be available to all children
    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 3. Create a custom hook for easy access in our UI components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};;