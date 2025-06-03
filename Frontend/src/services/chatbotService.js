import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://e2425-wads-l4acg3-server.csbihub.id/api';

const chatbotAPI = axios.create({
  baseURL: `${API_BASE_URL}/chatbot`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatbotService = {
  /**
   * Send a message to the AI chatbot
   * @param {string} message - The user's message
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Promise} - API response with AI reply and related articles
   */
  sendMessage: async (message, conversationHistory = []) => {
    try {
      const response = await chatbotAPI.post('/chat', {
        message,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      console.error('Chatbot API error:', error);
      throw error;
    }
  },

  /**
   * Get suggested questions for the chatbot
   * @returns {Promise} - API response with suggested questions
   */
  getSuggestedQuestions: async () => {
    try {
      const response = await chatbotAPI.get('/suggestions');
      return response.data;
    } catch (error) {
      console.error('Suggested questions API error:', error);
      throw error;
    }
  }
};

export default chatbotService; 