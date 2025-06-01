import React, { useState, useEffect } from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from 'recharts';
import ticketService from '../../services/api/ticketService';

const ResolutionTimeTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getTicketStats();
        if (response.success && response.stats.resolutionTimeTrend) {
          setData(response.stats.resolutionTimeTrend);
        }
      } catch (err) {
        console.error('Error fetching resolution time trend data:', err);
        setError('Failed to load resolution time trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-800 font-medium">{`Time: ${label}`}</p>
          <p className="text-pink-600">
            {`Avg Time: ${payload[0].value} min`}
          </p>
          {payload[0].payload.count > 0 && (
            <p className="text-gray-600 text-sm">
              {`Tickets resolved: ${payload[0].payload.count}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Resolution Time Trend</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Resolution Time Trend</h2>
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Resolution Time Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#6B7280' }} />
          <YAxis tick={{ fill: '#6B7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" iconType="circle" formatter={() => 'Avg Time (min)'} />
          <Bar dataKey="avgTime" fill="#ec4899" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResolutionTimeTrendChart; 