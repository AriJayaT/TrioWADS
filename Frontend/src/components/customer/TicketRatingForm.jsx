import React, { useState } from 'react';
import { FaStar, FaSpinner } from 'react-icons/fa';
import ticketService from '../../services/api/ticketService';

const TicketRatingForm = ({ ticketId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const ratingData = {
        rating,
        feedback
      };
      
      const response = await ticketService.submitRating(ticketId, ratingData);
      console.log('Rating submitted successfully:', response);
      setSuccess(true);
      
      // Call parent component's onSubmit callback if provided
      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit(ratingData);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      
      // Try to extract the error message from the response
      let errorMessage = 'Failed to submit rating. Please try again.';
      
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-3">
          {[...Array(5)].map((_, index) => (
            <FaStar
              key={index}
              className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
              size={24}
            />
          ))}
        </div>
        <p className="text-green-600 font-medium">Thank you for your feedback!</p>
        <p className="text-gray-600 mt-1">Your rating has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="p-1">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Rate your support experience
      </h3>
      <p className="text-gray-600 mb-4">
        Please take a moment to rate your experience with our support team.
      </p>
      
      {error && (
        <div className="mb-4 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleRatingSubmit}>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="mr-3 text-sm text-gray-600">Rating:</span>
            <div className="flex">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                
                return (
                  <label key={index} className="cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      className="hidden"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                    />
                    <FaStar
                      size={24}
                      className="mr-1"
                      color={(ratingValue <= (hover || rating)) 
                        ? "#FBBF24"  // Bright yellow when selected/hovered
                        : "#E5E7EB"  // Light gray when not selected
                      }
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional feedback (optional):
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              placeholder="Please share any additional feedback you may have..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="inline-block mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketRatingForm; 