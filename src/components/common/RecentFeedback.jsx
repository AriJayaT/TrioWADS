import React from 'react';
import { FaStar } from 'react-icons/fa';

const feedbackData = [
  {
    name: 'Emily Parker',
    time: '2 hours ago',
    satisfaction: 'Very Satisfied',
    message: 'Amazing customer service! The representative was incredibly helpful and solved my issue within minutes.',
  },
  {
    name: 'Michael Chang',
    time: '5 hours ago',
    satisfaction: 'Satisfied',
    message: 'Very satisfied with the support. Quick response and professional service.',
  },
  {
    name: 'Sarah Wilson',
    time: '1 day ago',
    satisfaction: 'Very Satisfied',
    message: 'Exceptional support team! They went above and beyond to help me.',
  },
];

const RecentFeedback = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Feedback</h2>
        <a href="#" className="text-pink-400 text-sm font-medium hover:underline">View All</a>
      </div>
      <div className="space-y-4">
        {feedbackData.map((entry, index) => (
          <div key={index} className="border border-pink-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <div>
                <div className="font-semibold text-gray-900">{entry.name}</div>
                <div className="text-xs text-gray-400">{entry.time}</div>
              </div>
              <div className="flex items-center gap-1 text-sm text-pink-500 font-medium">
                {entry.satisfaction}
                <FaStar className="text-xs" />
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">"{entry.message}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentFeedback; 