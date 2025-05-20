import React, { useState } from 'react';

const agents = [
  {
    initials: 'SA',
    name: 'Sarah Anderson',
    email: 'sarah.a@jellycat.com',
    role: 'Senior Agent',
    status: 'online',
    tickets: 847,
    resolution: '94%',
    response: '8m',
    csat: 4.9,
  },
  {
    initials: 'MT',
    name: 'Mike Thompson',
    email: 'mike.t@jellycat.com',
    role: 'Support Agent',
    status: 'online',
    tickets: 623,
    resolution: '91%',
    response: '11m',
    csat: 4.7,
  },
  {
    initials: 'LC',
    name: 'Lisa Chen',
    email: 'lisa.c@jellycat.com',
    role: 'Support Agent',
    status: 'away',
    tickets: 542,
    resolution: '88%',
    response: '15m',
    csat: 4.6,
  },
  {
    initials: 'JW',
    name: 'James Wilson',
    email: 'james.w@jellycat.com',
    role: 'Senior Agent',
    status: 'offline',
    tickets: 756,
    resolution: '93%',
    response: '10m',
    csat: 4.8,
  },
  {
    initials: 'ED',
    name: 'Emily Davis',
    email: 'emily.d@jellycat.com',
    role: 'Support Agent',
    status: 'online',
    tickets: 489,
    resolution: '87%',
    response: '13m',
    csat: 4.5,
  },
];

const statusStyles = {
  online: 'bg-green-100 text-green-500',
  away: 'bg-yellow-100 text-yellow-500',
  offline: 'bg-red-100 text-red-500',
};

const AgentTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-100 relative">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search agents..."
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <div className="flex gap-4">
          <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            All Statuses
          </button>
          <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            All Roles
          </button>
        </div>
      </div>

      {/* Agent Rows */}
      {agents.map((agent, idx) => (
        <div
          key={idx}
          className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 mb-4 border border-pink-100 rounded-xl gap-3"
        >
          <div className="flex items-center gap-4 w-full sm:w-1/3">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              {agent.initials}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{agent.name}</div>
              <div className="text-sm text-gray-500">{agent.email}</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 w-full sm:w-1/6">{agent.role}</div>

          <div className="w-full sm:w-1/6">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusStyles[agent.status]}`}>
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 w-full sm:w-1/3">
            <div>
              <div className="font-semibold">{agent.tickets}</div>
              <div className="text-xs text-gray-400">Tickets</div>
            </div>
            <div>
              <div className="font-semibold">{agent.resolution}</div>
              <div className="text-xs text-gray-400">Resolution</div>
            </div>
            <div>
              <div className="font-semibold">{agent.response}</div>
              <div className="text-xs text-gray-400">Avg Response</div>
            </div>
            <div>
              <div className="font-semibold">{agent.csat}</div>
              <div className="text-xs text-gray-400">CSAT</div>
            </div>
          </div>

          {/* Actions Button */}
          <div className="relative">
            <button
              className="text-pink-400 font-medium text-sm hover:underline cursor-pointer"
              onClick={() => toggleDropdown(idx)}
            >
              Actions
            </button>

            {/* Dropdown */}
            {openDropdown === idx && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-pink-100 rounded-xl shadow-md z-10 p-2 text-sm">
                <div className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer">View Performance</div>
                <div className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer">Edit Profile</div>
                <div className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer">Manage Access</div>
                <div className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer">Reset Password</div>
                <div className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-md cursor-pointer">Deactivate</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentTable; 