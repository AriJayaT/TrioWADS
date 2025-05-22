import apiClient from './apiClient';

/**
 * Article service for managing knowledge base articles
 */
const articleService = {
  /**
   * Get all articles with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} [params.category] - Filter by category
   * @param {string} [params.search] - Search term
   * @param {boolean} [params.published=true] - Filter by published status
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Results per page
   * @returns {Promise<Object>} - Articles with pagination info
   */
  getArticles: async (params = {}) => {
    try {
      const response = await apiClient.get('/articles', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch articles';
    }
  },
  
  /**
   * Get a specific article by ID
   * @param {string} articleId - The article ID
   * @returns {Promise<Object>} - Article data with related articles
   */
  getArticle: async (articleId) => {
    try {
      const response = await apiClient.get(`/articles/${articleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch article';
    }
  },
  
  /**
   * Create a new knowledge base article
   * @param {Object} articleData - Article data
   * @param {string} articleData.title - Article title
   * @param {string} articleData.category - Article category
   * @param {string} articleData.description - Brief description
   * @param {string} articleData.content - HTML content
   * @param {Array} [articleData.tags] - Article tags
   * @param {boolean} [articleData.isPublished=true] - Whether to publish immediately
   * @returns {Promise<Object>} - Created article data
   */
  createArticle: async (articleData) => {
    try {
      const response = await apiClient.post('/articles', articleData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create article';
    }
  },
  
  /**
   * Update an article
   * @param {string} articleId - The article ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.title] - New title
   * @param {string} [updateData.category] - New category
   * @param {string} [updateData.description] - New description
   * @param {string} [updateData.content] - New content
   * @param {Array} [updateData.tags] - New tags
   * @param {boolean} [updateData.isPublished] - Published status
   * @param {Array} [updateData.relatedArticles] - Related article IDs
   * @returns {Promise<Object>} - Updated article data
   */
  updateArticle: async (articleId, updateData) => {
    try {
      const response = await apiClient.put(`/articles/${articleId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update article';
    }
  },
  
  /**
   * Delete an article
   * @param {string} articleId - The article ID
   * @returns {Promise<Object>} - Success message
   */
  deleteArticle: async (articleId) => {
    try {
      const response = await apiClient.delete(`/articles/${articleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to delete article';
    }
  },
  
  /**
   * Rate an article (helpful/unhelpful)
   * @param {string} articleId - The article ID
   * @param {Object} ratingData - Rating data
   * @param {boolean} ratingData.isHelpful - Whether the article was helpful
   * @returns {Promise<Object>} - Updated helpful/unhelpful counts
   */
  rateArticle: async (articleId, ratingData) => {
    try {
      const response = await apiClient.post(`/articles/${articleId}/rate`, ratingData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to submit rating';
    }
  },
  
  /**
   * Search articles
   * @param {string} searchTerm - Term to search for
   * @returns {Promise<Object>} - Search results
   */
  searchArticles: async (searchTerm) => {
    try {
      const response = await apiClient.get('/articles', { 
        params: { search: searchTerm } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to search articles';
    }
  }
};

export default articleService; 