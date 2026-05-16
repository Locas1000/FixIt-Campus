// src/services/userService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/users`
    : 'http://localhost:5000/api/users';

const getAuthHeaders = () => {
    const token = localStorage.getItem('fixit_token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

/**
 * Fetches users filtered by their role.
 * Mathew will need to ensure the backend supports: GET /api/users?role=Technician
 */
const getUsersByRole = async (role) => {
    try {
        const response = await axios.get(`${API_URL}?role=${role}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to fetch ${role}s.`);
    }
};

export const userService = {
    getUsersByRole,
};