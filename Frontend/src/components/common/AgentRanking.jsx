import React, { useState } from 'react';
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const AgentRanking = ({ data = [], timeRange = 'this-week' }) => {
  const [sortKey, setSortKey] = useState('resolvedTickets');

  // Map backend data to display format
  const agentsData = data.map(agent => ({
    name: agent.name || 'Unknown',
    role: 'Support Agent', // Could be enhanced with role from backend
    initials: agent.name ? agent.name.split(' ').map(n => n[0]).join('') : '??',
    tickets: agent.totalTickets || 0,
    resolved: agent.resolvedTickets || 0,
    avgResolution: agent.avgResolutionTime ? `${agent.avgResolutionTime}m` : '0m',
    responseTime: agent.avgResponseTime || 0,
    rating: agent.avgRating || 0,
    sla: agent.resolutionRate || 0,
    trend: agent.resolvedTickets > (agent.totalTickets * 0.8) ? 'up' : 'down'
  }));

  const sortedAgents = [...agentsData].sort((a, b) => {
    if (sortKey === 'responseTime') return a[sortKey] - b[sortKey]; // lower is better
    return b[sortKey] - a[sortKey]; // higher is better
  });

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-bold mb-4">Agent Rankings</h2>
        <div className="text-center py-8 text-gray-500">
          No agent data available for {timeRange}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Agent Rankings</h2>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="resolved">Resolved Tickets</option>
          <option value="tickets">Total Tickets</option>
          <option value="rating">Satisfaction Level</option>
          <option value="responseTime">Response Time</option>
          <option value="sla">Resolution Rate</option>
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
                <div className="font-medium">{agent.resolved}/{agent.tickets} tickets</div>
                <div className="text-xs text-gray-400">{agent.avgResolution} avg</div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="font-medium">{agent.rating ? agent.rating.toFixed(1) : '0.0'}</span>
                  <FaStar className="text-pink-400 text-xs" />
                </div>
                <div className="text-xs text-gray-400">{agent.responseTime}m response</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{agent.sla ? agent.sla.toFixed(0) : 0}%</div>
                <div className="text-xs text-gray-400">Resolution Rate</div>
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