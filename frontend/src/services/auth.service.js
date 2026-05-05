import axios from 'axios';

// Leverage Vite's environment variables, defaulting to local dev port
const API_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/auth`
    : 'http://localhost:5000/api/auth';

/**
 * Logs in a user and returns their token and profile data.
 */
const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        });

        // Your backend returns { token, user }
        return response.data;
    } catch (error) {
        // Extract the exact error message sent by your Express controller
        throw new Error(error.response?.data?.message || 'An error occurred during login.');
    }
};

/**
 * Registers a new user.
 */
const register = async (name, email, password, role) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            name,
            email,
            password,
            role
        });

        // Your backend returns { token, user }
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'An error occurred during registration.');
    }
};

const authService = {
    login,
    register
};

export default authService;