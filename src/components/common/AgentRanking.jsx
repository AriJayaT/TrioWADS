import React, { useState } from 'react';
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const agentsData = [
  { name: 'Sarah Anderson', role: 'Senior Agent', initials: 'SA', tickets: 284, avgResolution: '1h 20m', responseTime: 6, rating: 4.9, sla: 98, trend: 'up' },
  { name: 'Mike Thompson', role: 'Support Agent', initials: 'MT', tickets: 256, avgResolution: '1h 45m', responseTime: 8, rating: 4.7, sla: 95, trend: 'up' },
  { name: 'Lisa Chen', role: 'Senior Agent', initials: 'LC', tickets: 242, avgResolution: '1h 30m', responseTime: 7, rating: 4.8, sla: 96, trend: 'down' },
  { name: 'James Wilson', role: 'Support Agent', initials: 'JW', tickets: 228, avgResolution: '1h 55m', responseTime: 9, rating: 4.6, sla: 94, trend: 'up' },
  { name: 'Emily Davis', role: 'Support Agent', initials: 'ED', tickets: 215, avgResolution: '1h 50m', responseTime: 8, rating: 4.7, sla: 93, trend: 'down' },
];

const AgentRanking = () => {
  const [sortKey, setSortKey] = useState('tickets');

  const sortedAgents = [...agentsData].sort((a, b) => {
    if (sortKey === 'responseTime') return a[sortKey] - b[sortKey]; // lower is better
    return b[sortKey] - a[sortKey]; // higher is better
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Agent Rankings</h2>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="tickets">Tickets</option>
          <option value="rating">Satisfaction Level</option>
          <option value="responseTime">Response Time</option>
          <option value="sla">SLA</option>
        </select>
      </div>

      <div className="space-y-4">
        {sortedAgents.map((agent, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 rounded-xl border border-pink-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 font-bold flex items-center justify-center">
                {agent.initials}
              </div>
              <div>
                <div className="font-semibold text-black">{agent.name}</div>
                <div className="text-sm text-gray-500">{agent.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="text-right">
                <div className="font-medium">{agent.tickets} tickets</div>
                <div className="text-xs text-gray-400">{agent.avgResolution} avg</div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="font-medium">{agent.rating}</span>
                  <FaStar className="text-pink-400 text-xs" />
                </div>
                <div className="text-xs text-gray-400">{agent.responseTime}m response</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{agent.sla}%</div>
                <div className="text-xs text-gray-400">SLA</div>
              </div>
              <div>
                {agent.trend === 'up' ? (
                  <FaArrowUp className="text-green-500" />
                ) : (
                  <FaArrowDown className="text-red-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentRanking; 