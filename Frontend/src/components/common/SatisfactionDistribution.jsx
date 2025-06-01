import React from 'react';
import { FaStar } from 'react-icons/fa';

const SatisfactionDistribution = ({ data, timeRange }) => {
  const { avgRating = 0, totalRatings = 0, distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } = data || {};

  const ratings = [
    { score: 5, count: distribution[5] || 0 },
    { score: 4, count: distribution[4] || 0 },
    { score: 3, count: distribution[3] || 0 },
    { score: 2, count: distribution[2] || 0 },
    { score: 1, count: distribution[1] || 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-bold text-black">Satisfaction Distribution</h2>
        <div className="text-sm text-pink-500 font-semibold flex items-center gap-1">
          <FaStar className="text-pink-400" />
          {avgRating.toFixed(1)} <span className="text-gray-400">({totalRatings} responses)</span>
        </div>
      </div>

      {totalRatings === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaStar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>No ratings available for this period</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((rating) => {
            const percentage = totalRatings > 0 ? ((rating.count / totalRatings) * 100).toFixed(0) : 0;
            return (
              <div key={rating.score} className="flex items-center gap-3 text-sm">
                <div className="w-4 text-right">{rating.score}</div>
                <div className="flex-1 bg-pink-50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-pink-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-gray-700">{rating.count}</div>
                <div className="w-10 text-right text-gray-400">{percentage}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SatisfactionDistribution; 