import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/tickets`
    : 'http://localhost:5000/api/tickets';

// Helper to get the auth header
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Adjust if you use Context/Cookies
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

/**
 * Fetches all tickets from the database.
 */
const getTickets = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tickets.');
    }
};

/**
 * Creates a new ticket.
 */
const createTicket = async (ticketData) => {
    try {
        const response = await axios.post(API_URL, ticketData, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create ticket.');
    }
};

/**
 * Updates a ticket's status.
 */
const updateTicketStatus = async (id, newStatus, comment, userId) => {
    try {
        const response = await axios.put(`${API_URL}/${id}/status`, { // Adjusted to standard REST path
            newStatus,
            comment,
            userId
        }, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update ticket status.');
    }
};

export const ticketService = {
    getTickets,
    createTicket,
    updateTicketStatus
};