import React from 'react';
import { FaStar } from 'react-icons/fa';

const RecentFeedback = ({ data = [], timeRange = 'this-week', recentRatings = [] }) => {
  // Use recentRatings if available, otherwise fallback to empty array
  const feedbackData = recentRatings && recentRatings.length > 0 ? recentRatings : [];

  // Filter feedback based on timeRange if needed
  const getFilteredFeedback = () => {
    if (feedbackData.length === 0) {
      return [];
    }

    // For today view, we could add additional filtering if needed
    // The backend already filters by timeRange, so we'll use the data as-is
    return feedbackData.slice(0, 5); // Show max 5 recent feedback items
  };

  const filteredFeedback = getFilteredFeedback();

  // Function to get star rating display
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-xs ${index < rating ? 'text-pink-500' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {timeRange === 'today' ? "Today's Recent Feedback" : "Recent Feedback"}
        </h2>
      </div>

      {filteredFeedback.length > 0 ? (
        <div className="space-y-4">
          {filteredFeedback.map((entry, index) => (
            <div key={entry._id || index} className="border border-pink-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <div className="font-semibold text-gray-900">{entry.name}</div>
                  <div className="text-xs text-gray-400">{entry.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(entry.rating)}
                  </div>
                  <div className="text-sm text-pink-500 font-medium">
                    {entry.satisfaction}
                  </div>
                </div>
              </div>
              {entry.feedback && entry.feedback.trim() !== '' ? (
                <p className="text-sm text-gray-700 mt-2">"{entry.feedback}"</p>
              ) : (
                <p className="text-sm text-gray-500 italic mt-2">No written feedback provided</p>
              )}
              {entry.ticketSubject && (
                <div className="text-xs text-gray-400 mt-1">
                  Ticket: {entry.ticketSubject}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">💬</div>
          <p className="text-gray-500 text-sm">
            {timeRange === 'today' 
              ? "No customer feedback received today" 
              : `No customer feedback available for ${timeRange}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentFeedback; 