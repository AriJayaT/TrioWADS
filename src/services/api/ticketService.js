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
   * @param {string} [params.assignedTo] - Filter by assigned agent ID
   * @param {boolean} [params.unassigned] - Get only unassigned tickets
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Results per page
   * @returns {Promise<Object>} - Tickets with pagination info
   */
  getTickets: async (params = {}) => {
    try {
      const requestParams = { ...params };
      
      // If unassigned is true, make sure it's properly formatted for the API
      if (requestParams.unassigned) {
        requestParams.unassigned = 'true';
      }
      
      const response = await apiClient.get('/tickets', { params: requestParams });
      
      // Ensure all tickets have consistent ID fields (both id and _id)
      if (response.data.tickets && Array.isArray(response.data.tickets)) {
        response.data.tickets = response.data.tickets.map(ticket => {
          const updatedTicket = { ...ticket };
          if (updatedTicket._id && !updatedTicket.id) {
            updatedTicket.id = updatedTicket._id;
          } else if (updatedTicket.id && !updatedTicket._id) {
            updatedTicket._id = updatedTicket.id;
          }
          return updatedTicket;
        });
      }
      
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
      
      // Ensure consistent ID field
      if (response.data.ticket) {
        const ticket = response.data.ticket;
        if (ticket._id && !ticket.id) {
          ticket.id = ticket._id;
        } else if (ticket.id && !ticket._id) {
          ticket._id = ticket.id;
        }
      }
      
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
   * @param {string} ticketData.priority - Ticket priority (optional)
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
      console.log(`Sending request to update ticket ${ticketId}:`, updateData);
      const response = await apiClient.put(`/tickets/${ticketId}`, updateData);
      console.log(`Update response for ticket ${ticketId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket ${ticketId}:`, error.response?.data || error.message);
      
      // Create a more informative error
      const errorMessage = error.response?.data?.error || 'Failed to update ticket';
      const enhancedError = new Error(errorMessage);
      
      // Add response data for debugging
      enhancedError.responseData = error.response?.data;
      enhancedError.statusCode = error.response?.status;
      
      throw enhancedError;
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
   * Get ticket statistics (for agent/admin dashboard)
   * @returns {Promise<Object>} - Ticket statistics
   */
  getTicketStats: async () => {
    try {
      const response = await apiClient.get('/tickets/stats');
      return response.data.stats;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch ticket statistics';
    }
  },
  
  /**
   * Submit a rating for a ticket
   * @param {string} ticketId - The ticket ID
   * @param {Object} ratingData - Rating data
   * @param {number} ratingData.rating - Rating value (1-5)
   * @param {string} [ratingData.feedback] - Optional feedback text
   * @returns {Promise<Object>} - Created rating data
   */
  submitRating: async (ticketId, ratingData) => {
    try {
      const response = await apiClient.post(`/tickets/${ticketId}/rating`, ratingData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to submit rating';
    }
  },
  
  /**
   * Fix ticket assignments (admin utility)
   * @returns {Promise<Object>} - Result of the fix operation
   */
  fixTicketAssignments: async () => {
    try {
      const response = await apiClient.get('/tickets/fix-assignments');
      return response.data;
    } catch (error) {
      console.error('Error fixing ticket assignments:', error);
      throw error.response?.data?.error || 'Failed to fix ticket assignments';
    }
  },
  
  /**
   * Get the rating for a ticket
   * @param {string} ticketId - The ticket ID
   * @returns {Promise<Object>} - Rating data
   */
  getTicketRating: async (ticketId) => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/rating`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Not found is a normal response for unrated tickets
        return { success: false, rating: null };
      }
      throw error.response?.data?.error || 'Failed to get ticket rating';
    }
  },
  
  /**
   * Remove a closed ticket from agent's view
   * @param {string} ticketId - The ticket ID to remove
   * @returns {Promise<Object>} - Response data
   */
  removeTicketFromView: async (ticketId) => {
    try {
      const response = await apiClient.put(`/tickets/${ticketId}/remove`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to remove ticket from view';
    }
  }
};

export default ticketService; 