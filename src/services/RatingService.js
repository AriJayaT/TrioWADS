// RatingService.js - Handles ticket rating operations

// Simulated ratings database
let ratingsData = [
  { 
    id: 1, 
    ticketId: 'TK-2024-002', 
    customerId: 'user-123',
    rating: 5, 
    feedback: 'Emily was extremely helpful and provided clear instructions!',
    agentId: 'agent-456',
    agentName: 'Emily Clark',
    timestamp: '2024-05-15T10:30:00Z'
  }
];

/**
 * Submit a new rating for a ticket
 * @param {Object} ratingData - The rating data to submit
 * @param {string} ratingData.ticketId - The ID of the ticket being rated
 * @param {number} ratingData.rating - The rating (1-5)
 * @param {string} ratingData.feedback - Optional feedback text
 * @param {string} ratingData.customerId - The ID of the customer submitting the rating
 * @param {string} ratingData.agentId - The ID of the agent being rated
 * @param {string} ratingData.agentName - The name of the agent being rated
 * @returns {Promise<Object>} - The submitted rating data with an ID
 */
export const submitRating = async (ratingData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Validation
  if (!ratingData.ticketId) {
    throw new Error('Ticket ID is required');
  }
  
  if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // Check if this ticket has already been rated
  const existingRating = ratingsData.find(r => r.ticketId === ratingData.ticketId);
  if (existingRating) {
    throw new Error('This ticket has already been rated');
  }
  
  // Create a new rating object
  const newRating = {
    id: ratingsData.length + 1,
    timestamp: new Date().toISOString(),
    ...ratingData
  };
  
  // Add to our "database"
  ratingsData.push(newRating);
  
  return newRating;
};

/**
 * Check if a ticket has been rated
 * @param {string} ticketId - The ID of the ticket to check
 * @returns {Promise<boolean>} - Whether the ticket has been rated
 */
export const hasTicketBeenRated = async (ticketId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return ratingsData.some(rating => rating.ticketId === ticketId);
};

/**
 * Get the rating for a ticket
 * @param {string} ticketId - The ID of the ticket
 * @returns {Promise<Object|null>} - The rating data or null if not found
 */
export const getTicketRating = async (ticketId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return ratingsData.find(rating => rating.ticketId === ticketId) || null;
};

/**
 * Get average rating for an agent
 * @param {string} agentId - The ID of the agent
 * @returns {Promise<number>} - The average rating (0-5)
 */
export const getAgentAverageRating = async (agentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const agentRatings = ratingsData.filter(rating => rating.agentId === agentId);
  
  if (agentRatings.length === 0) {
    return 0;
  }
  
  const sum = agentRatings.reduce((total, rating) => total + rating.rating, 0);
  return Number((sum / agentRatings.length).toFixed(1));
};

/**
 * Get overall satisfaction metrics
 * @returns {Promise<Object>} - Satisfaction metrics
 */
export const getSatisfactionMetrics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const totalRatings = ratingsData.length;
  
  if (totalRatings === 0) {
    return {
      averageSatisfaction: 0,
      totalResponses: 0,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
  }
  
  // Calculate average satisfaction
  const sum = ratingsData.reduce((total, rating) => total + rating.rating, 0);
  const average = Number((sum / totalRatings).toFixed(1));
  
  // Calculate distribution
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  ratingsData.forEach(rating => {
    distribution[rating.rating]++;
  });
  
  return {
    averageSatisfaction: average,
    totalResponses: totalRatings,
    distribution
  };
};

export default {
  submitRating,
  hasTicketBeenRated,
  getTicketRating,
  getAgentAverageRating,
  getSatisfactionMetrics
}; 