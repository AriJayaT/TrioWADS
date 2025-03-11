import React from 'react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const AgentPerformance = () => {
  const agents = [
    {
      id: 1,
      initials: 'SA',
      name: 'Sarah Anderson',
      responseTime: '6m',
      tickets: 28,
      resolution: '94%',
      status: 'Online'
    },
    {
      id: 2,
      initials: 'MT',
      name: 'Mike Thompson',
      responseTime: '11m',
      tickets: 23,
      resolution: '91%',
      status: 'Online'
    },
    {
      id: 3,
      initials: 'LC',
      name: 'Lisa Chen',
      responseTime: '15m',
      tickets: 19,
      resolution: '88%',
      status: 'Away'
    },
    {
      id: 4,
      initials: 'JW',
      name: 'James Wilson',
      responseTime: '10m',
      tickets: 25,
      resolution: '93%',
      status: 'Offline'
    }
  ];

  return (
    <div className="mt-8">
      <div className="bg-white shadow-lg overflow-hidden rounded-4xl p-6 hover:shadow-pink-200">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-lg font-bold text-gray-700">Agent Performance</h2>
          <Button variant="simple" size="md">View All Agents</Button>
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