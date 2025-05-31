import React, { useEffect, useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const AgentPerformance = () => {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/agents", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();

      if (data.success) {
        const processed = data.agents.map(agent => {
          const initials = agent.name.split(" ").map(n => n[0]).join("");
          return {
            id: agent.id,
            initials,
            name: agent.name,
            responseTime: agent.stats?.avgResolutionTime || 'N/A',
            tickets: agent.assignedTickets?.length || 0,
            resolution: agent.stats?.resolution || '0%',
            status: agent.status || 'Offline'
          };
        });
        setAgents(processed);
      } else {
        setError("Failed to load agent data");
      }
    } catch (err) {
      console.error("Agent fetch failed:", err);
      setError("Error loading agents");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-8">
      <div className="bg-white shadow-lg overflow-hidden rounded-4xl p-6 hover:shadow-pink-200">
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-700">Agent Performance</h2>
        </div>
        {agents.map((agent, index) => (
          <div key={agent.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-pink-200 rounded-2xl mb-4 ${index !== agents.length - 1 ? 'border-b' : ''}`}>
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm">
                {agent.initials}
              </div>
              <div className="ml-4">
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-gray-500">Response Time: {agent.responseTime}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-0 w-full sm:w-auto">
              <div className="mr-0 sm:mr-8 text-center">
                <div>{agent.tickets} tickets</div>
              </div>
              <div className="mr-0 sm:mr-8 text-center">
                <div>{agent.resolution} resolution</div>
              </div>
              <div>
                <StatusBadge status={agent.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentPerformance;