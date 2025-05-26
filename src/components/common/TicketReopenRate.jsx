import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TicketReopenRate = () => {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);

  const fetchReopenStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/agents', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const processed = (res.data?.agents || []).map(agent => ({
        name: agent.name,
        rate: parseFloat(agent.stats?.reopenRate?.replace('%', '') || '0'),
      }));

      setAgents(processed);
    } catch (err) {
      console.error('Failed to load reopen rate:', err.response?.data || err.message);
      setError('Failed to load ticket reopen data');
    }
  };

  useEffect(() => {
    fetchReopenStats();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket Reopen Rate</h2>
      <div className="space-y-4">
        {agents.map((agent, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-800 font-medium">{agent.name}</span>
              <span className="text-sm text-gray-500 font-medium">{agent.rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2.5">
              <div
                className="bg-pink-400 h-2.5 rounded-full"
                style={{ width: `${agent.rate * 25}%` }} // assumes 4% = full bar
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketReopenRate;
