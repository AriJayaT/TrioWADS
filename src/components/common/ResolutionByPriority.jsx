import React, { useEffect, useState } from "react";

const ResolutionByPriority = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics/resolution-by-priority", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setData(resData.data);
        } else {
          setError("Failed to load priority data");
        }
      })
      .catch(err => {
        console.error("Priority fetch error:", err);
        setError("Something went wrong");
      });
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

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

      {data.map((item) => (
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
              style={{ width: `${Math.min((item.avgMinutes / 60) * 10, 100)}%` }}
            ></div>
          </div>
          <div className="text-green-500 font-semibold text-sm mt-1">{item.percentage}%</div>
        </div>
      ))}
    </div>
  );
};

export default ResolutionByPriority;
