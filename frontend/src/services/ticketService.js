import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/tickets`
    : 'http://localhost:5000/api/tickets';

const getAuthHeaders = () => {
    const token = localStorage.getItem('fixit_token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const getTickets = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tickets.');
    }
};

/**
 * Fetches a single ticket by its ID.
 */
const getTicketById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch ticket.');
    }
};

const createTicket = async (ticketData) => {
    try {
        const response = await axios.post(API_URL, ticketData, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create ticket.');
    }
};

const updateTicketStatus = async (id, newStatus, comment, userId) => {
    try {
        const response = await axios.put(`${API_URL}/${id}/status`, {
            newStatus,
            comment,
            userId
        }, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update ticket status.');
    }
};

/**
 * Fetches the full audit history for a ticket.
 */
const getTicketHistory = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}/history`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch ticket history.');
    }
};

export const ticketService = {
    getTickets,
    getTicketById,
    createTicket,
    updateTicketStatus,
    getTicketHistory,
};
