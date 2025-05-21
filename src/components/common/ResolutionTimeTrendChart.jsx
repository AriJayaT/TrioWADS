import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from 'recharts';

const data = [
  { time: '9AM', avgTime: 42 },
  { time: '10AM', avgTime: 56 },
  { time: '11AM', avgTime: 68 },
  { time: '12PM', avgTime: 58 },
  { time: '1PM', avgTime: 45 },
  { time: '2PM', avgTime: 52 },
  { time: '3PM', avgTime: 64 },
  { time: '4PM', avgTime: 55 },
  { time: '5PM', avgTime: 38 },
];

const ResolutionTimeTrendChart = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Resolution Time Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#6B7280' }} />
          <YAxis tick={{ fill: '#6B7280' }} />
          <Tooltip />
          <Legend verticalAlign="top" align="right" iconType="circle" formatter={() => 'Avg Time (min)'} />
          <Bar dataKey="avgTime" fill="#ec4899" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResolutionTimeTrendChart; 