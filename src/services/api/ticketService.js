import apiClient from './apiClient';

/**
 * Ticket service for managing support tickets
 */
const ticketService = {
  /**
   * Get all tickets with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} [params.status] - Filter by ticket status
   * @param {string} [params.priority] - Filter by priority
   * @param {string} [params.category] - Filter by category
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Results per page
   * @returns {Promise<Object>} - Tickets with pagination info
   */
  getTickets: async (params = {}) => {
    try {
      const response = await apiClient.get('/tickets', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch tickets';
    }
  },
  
  /**
   * Get a specific ticket by ID
   * @param {string} ticketId - The ticket ID
   * @returns {Promise<Object>} - Ticket data with replies
   */
  getTicket: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch ticket';
    }
  },
  
  /**
   * Create a new support ticket
   * @param {Object} ticketData - Ticket data
   * @param {string} ticketData.subject - Ticket subject
   * @param {string} ticketData.description - Ticket description
   * @param {string} ticketData.category - Ticket category
   * @param {string} ticketData.subcategory - Ticket subcategory
   * @param {Array} [ticketData.attachments] - Optional file attachments
   * @returns {Promise<Object>} - Created ticket data
   */
  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create ticket';
    }
  },
  
  /**
   * Update a ticket
   * @param {string} ticketId - The ticket ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.status] - New status
   * @param {string} [updateData.priority] - New priority
   * @param {string} [updateData.assignedTo] - Agent ID to assign to
   * @returns {Promise<Object>} - Updated ticket data
   */
  updateTicket: async (ticketId, updateData) => {
    try {
      const response = await apiClient.put(`/tickets/${ticketId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update ticket';
    }
  },
  
  /**
   * Add a reply to a ticket
   * @param {string} ticketId - The ticket ID
   * @param {Object} replyData - Reply data
   * @param {string} replyData.message - Reply content
   * @param {Array} [replyData.attachments] - Optional file attachments
   * @param {boolean} [replyData.isInternal=false] - Whether this is an internal note
   * @returns {Promise<Object>} - Created reply data
   */
  addReply: async (ticketId, replyData) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/replies`, replyData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to add reply';
    }
  },
  
  /**
   * Get ticket statistics (for admin dashboard)
   * @returns {Promise<Object>} - Ticket statistics
   */
  getTicketStats: async () => {
    try {
      const response = await apiClient.get('/tickets/stats');
      return response.data.stats;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch ticket statistics';
    }
  }
};

export default ticketService; 