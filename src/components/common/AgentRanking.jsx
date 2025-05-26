import React, { useEffect, useState } from 'react';
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';

const AgentRanking = () => {
  const [agents, setAgents] = useState([]);
  const [sortKey, setSortKey] = useState('tickets');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/agents', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Response from /api/users/agents:', res.data); // Debug response

      const processed = (res.data?.agents || []).map(agent => ({
        name: agent.name,
        role: agent.agentType || 'Support Agent',
        initials: agent.name?.split(' ').map(n => n[0]).join('') || '??',
        tickets: agent.assignedTickets?.length || 0,
        avgResolution: 'N/A',
        responseTime: 7,
        rating: 4.5,
        sla: parseInt(agent.stats?.resolution?.replace('%', '') || '0'),
        trend: 'up',
      }));

      setAgents(processed);
    } catch (err) {
      console.error('Fetch failed:', err.response?.status, err.response?.data || err.message); // For Better error logging
      setError('Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const sortedAgents = [...agents].sort((a, b) => {
    if (sortKey === 'responseTime') return a[sortKey] - b[sortKey];
    return b[sortKey] - a[sortKey];
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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