import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const SatisfactionDistribution = () => {
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  const [error, setError] = useState(null);

  const fetchRatings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ratings/distribution", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setRatings(res.data.distribution || []);
      setAverage(res.data.average || 0);
      setTotalResponses(res.data.totalResponses || 0);
    } catch (err) {
      console.error("Error fetching CSAT data:", err);
      setError("Failed to load satisfaction data");
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

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
          const percentage = totalResponses > 0
            ? ((rating.count / totalResponses) * 100).toFixed(0)
            : 0;

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