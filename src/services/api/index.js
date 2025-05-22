import apiClient from './apiClient';
import authService from './authService';
import ticketService from './ticketService';
import articleService from './articleService';

export {
  apiClient,
  authService,
  ticketService,
  articleService
};

// Default export for convenience
export default {
  api: apiClient,
  auth: authService,
  tickets: ticketService,
  articles: articleService
}; 