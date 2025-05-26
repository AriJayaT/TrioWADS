import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const ResolutionTimeTrendChart = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics/resolution-time-trend", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError("Failed to load trend data");
      })
      .catch(err => {
        console.error("Trend fetch failed:", err);
        setError("Something went wrong");
      });
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Resolution Time Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#6B7280' }} />
          <YAxis tick={{ fill: '#6B7280' }} />
          <Tooltip />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            formatter={() => 'Avg Time (min)'}
          />
          <Bar dataKey="avgTime" fill="#ec4899" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResolutionTimeTrendChart;
