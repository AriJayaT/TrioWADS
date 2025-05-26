import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TicketVolumeTrend = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics/ticket-volume-trend", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError("Failed to load ticket volume data");
      })
      .catch(err => {
        console.error("Ticket volume fetch failed", err);
        setError("Something went wrong");
      });
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Ticket Volume Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="New" fill="#f4a3c3" name="New Tickets" />
          <Bar dataKey="Resolved" fill="#61c49b" name="Resolved Tickets" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketVolumeTrend;
