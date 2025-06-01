import React from 'react';
import { FaStar } from 'react-icons/fa';

const TicketRatingDisplay = ({ rating }) => {
  if (!rating) {
    return null;
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Your Feedback
      </h3>
      
      <div className="mb-3">
        <div className="flex items-center mb-2">
          <span className="mr-3 text-sm font-medium text-gray-700">Your Rating:</span>
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={index < rating.rating ? 'text-yellow-400' : 'text-gray-300'}
                size={24}
              />
            ))}
          </div>
        </div>
      </div>
      
      {rating.feedback && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Your Feedback:</h4>
          <div className="p-3 bg-white rounded border border-gray-200 text-gray-700">
            {rating.feedback}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Thank you for providing your feedback. Your rating helps us improve our service.</p>
      </div>
    </div>
  );
};

export default TicketRatingDisplay; 