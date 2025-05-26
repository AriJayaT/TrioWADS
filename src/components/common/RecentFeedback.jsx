import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RecentFeedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [error, setError] = useState(null);

  const timeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return `${days} days ago`;
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/ratings/recent", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setFeedbackData(data.feedback || []);
      })
      .catch(err => {
        console.error("Feedback fetch failed", err);
        setError("Could not load feedback");
      });
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

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
                <div className="text-xs text-gray-400">{timeAgo(entry.time)}</div>
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
