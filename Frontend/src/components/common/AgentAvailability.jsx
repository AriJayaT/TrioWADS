import React from 'react';

const agents = [
  { name: 'Sarah Anderson', initials: 'SA', load: 4, status: 'online' },
  { name: 'Mike Thompson', initials: 'MT', load: 6, status: 'online' },
  { name: 'Lisa Chen', initials: 'LC', load: 2, status: 'away' },
  { name: 'Emily Davis', initials: 'ED', load: 4, status: 'online' },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-500';
    case 'away':
      return 'bg-yellow-100 text-yellow-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const AgentAvailability = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-200">
      <h2 className="text-lg font-semibold mb-4">Agent Availability</h2>
      {agents.map((agent) => (
        <div
          key={agent.name}
          className="flex items-center gap-4 border border-pink-100 rounded-xl p-3 mb-3"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold">
            {agent.initials}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-800">{agent.name}</div>
            <div className="text-sm text-gray-500">Current Load: {agent.load} tickets</div>
          </div>
          <div
            className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(agent.status)}`}
          >
            {agent.status}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentAvailability; 