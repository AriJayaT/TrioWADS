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

      // Log the raw data to debug
      console.log('Raw agent data:', res.data);

      const processed = (res.data?.agents || []).map(agent => {
        // Log individual agent stats
        console.log(`Agent ${agent.name} stats:`, agent.stats);
        
        // Calculate reopen rate from the raw numbers for more accuracy
        const reopenRate = agent.stats?.reopenedTickets && agent.stats?.closedTickets
          ? ((agent.stats.reopenedTickets / agent.stats.closedTickets) * 100).toFixed(1)
          : '0.0';
        
        console.log(`Calculated reopen rate for ${agent.name}:`, {
          reopenedTickets: agent.stats?.reopenedTickets || 0,
          closedTickets: agent.stats?.closedTickets || 0,
          calculatedRate: reopenRate
        });

        return {
          name: agent.name,
          rate: parseFloat(reopenRate),
          totalTickets: agent.stats?.closedTickets || 0,
          reopenedTickets: agent.stats?.reopenedTickets || 0
        };
      });

      console.log('Processed agent data:', processed);
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
              <span className="text-sm text-gray-500 font-medium">
                {agent.rate.toFixed(1)}% 
                <span className="text-xs text-gray-400 ml-1">
                  ({agent.reopenedTickets} of {agent.totalTickets} tickets)
                </span>
              </span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2.5">
              <div
                className="bg-pink-400 h-2.5 rounded-full"
                style={{ 
                  // Scale to make the bar more visible - max at 100%
                  width: `${Math.min(agent.rate, 100)}%`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketReopenRate;
