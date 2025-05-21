import React from 'react';
import { FaStar } from 'react-icons/fa';

const ratings = [
  { score: 5, count: 848 },
  { score: 4, count: 274 },
  { score: 3, count: 75 },
  { score: 2, count: 37 },
  { score: 1, count: 13 },
];

const totalResponses = ratings.reduce((sum, r) => sum + r.count, 0);
const average = 4.8; // You can calculate it dynamically if needed

const SatisfactionDistribution = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-bold text-black">Satisfaction Distribution</h2>
        <div className="text-sm text-pink-500 font-semibold flex items-center gap-1">
          <FaStar className="text-pink-400" />
          {average} <span className="text-gray-400">({totalResponses} responses)</span>
        </div>
      </div>

      <div className="space-y-3">
        {ratings.map((rating) => {
          const percentage = ((rating.count / totalResponses) * 100).toFixed(0);
          return (
            <div key={rating.score} className="flex items-center gap-3 text-sm">
              <div className="w-4 text-right">{rating.score}</div>
              <div className="flex-1 bg-pink-50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-400 h-full rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-12 text-right text-gray-700">{rating.count}</div>
              <div className="w-10 text-right text-gray-400">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SatisfactionDistribution; 