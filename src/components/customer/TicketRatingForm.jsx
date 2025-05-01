import React, { useState } from 'react';
import RatingStars from '../common/RatingStars';
import { useAuth } from '../../context/AuthContext';

const TicketRatingForm = ({ 
  ticketId, 
  agentName,
  onRatingSubmitted = () => {},
  onCancel = () => {} 
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  
  // Handle rating change
  const handleRatingChange = (value) => {
    setRating(value);
    setError('');
  };
  
  // Handle feedback change
  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };
  
  // Submit the rating and feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (rating === 0) {
      setError('Please select a rating before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // This would be an API call to your backend
      // const response = await fetch('/api/tickets/rating', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ticketId,
      //     rating,
      //     feedback,
      //     customerId: user.id
      //   }),
      // });
      
      // const data = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to submit rating');
      // }
      
      // Simulate API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      onRatingSubmitted({ ticketId, rating, feedback });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setRating(0);
        setFeedback('');
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If rating was successfully submitted, show success message
  if (success) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-700">Thank you for your feedback!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-pink-100 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        How was your experience?
      </h3>
      
      {agentName && (
        <p className="text-sm text-gray-600 mb-4">
          Your ticket has been resolved by {agentName}. Please rate your experience.
        </p>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your rating
          </label>
          <RatingStars
            initialRating={rating}
            onChange={handleRatingChange}
            size="lg"
            showValue={true}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Additional feedback (optional)
          </label>
          <textarea
            id="feedback"
            rows="3"
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Please share your thoughts about the service..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Skip
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketRatingForm; 