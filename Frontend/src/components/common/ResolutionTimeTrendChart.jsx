import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from 'recharts';

const ResolutionTimeTrendChart = ({ data = [], timeRange = 'this-week' }) => {
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {timeRange === 'today' ? "Today's Resolution Time Trend" : "Resolution Time Trend"}
      </h2>
      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          {timeRange === 'today' ? 
            'No resolution time trend data available for today' : 
            `No resolution time trend data available for ${timeRange}`
          }
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default ResolutionTimeTrendChart; 