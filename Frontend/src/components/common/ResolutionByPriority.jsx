import React, { useState, useEffect } from "react";
import ticketService from '../../services/api/ticketService';

const ResolutionByPriority = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getTicketStats();
        if (response.success && response.stats.resolutionByPriority) {
          setData(response.stats.resolutionByPriority);
        }
      } catch (err) {
        console.error('Error fetching resolution by priority data:', err);
        setError('Failed to load resolution time data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Resolution Time by Priority</h2>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Resolution Time by Priority</h2>
        </div>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Resolution Time by Priority</h2>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-pink-400"></div> Current
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-pink-200"></div> Target
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No resolution time data available
        </div>
      ) : (
        data.map((item) => (
          <div key={item.priority} className="mb-6">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span className="font-medium">
                {item.priority} <span className="text-gray-400">({item.count})</span>
              </span>
              <span className="text-gray-700 font-semibold">{item.current}</span>
            </div>
            <div className="relative w-full h-3 bg-pink-200 rounded-full">
              <div
                className="absolute top-0 left-0 h-3 bg-pink-400 rounded-full"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="text-green-500 font-semibold text-sm mt-1">{item.percentage}%</div>
          </div>
        ))
      )}
    </div>
  );
};

export default ResolutionByPriority; 