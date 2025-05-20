// src/pages/admin/AgentManagement.jsx (Galih Added This)
import React from 'react';
import DashboardLayout from '/src/components/layout/DashboardLayout'; // Use the shared dashboard layout

const AgentManagement = () => {
  const unassignedTickets = [
    { id: 'TK-2024-007', priority: 'high', subject: 'Missing Order Confirmation', customer: 'Robert Miller', waitTime: '45m' },
    { id: 'TK-2024-008', priority: 'normal', subject: 'Product Size Question', customer: 'Alice Johnson', waitTime: '30m' },
    { id: 'TK-2024-009', priority: 'high', subject: 'Billing Discrepancy', customer: 'David Lee', waitTime: '1h' }
  ];

  const agents = [
    { initials: 'SA', name: 'Sarah Anderson', email: 'sarah.a@jellycat.com', role: 'Senior Agent', status: 'Online', tickets: 847, resolution: '94%', avgResponse: '8m', csat: '4.9' },
    { initials: 'MT', name: 'Mike Thompson', email: 'mike.t@jellycat.com', role: 'Support Agent', status: 'Online', tickets: 623, resolution: '91%', avgResponse: '11m', csat: '4.7' },
    { initials: 'LC', name: 'Lisa Chen', email: 'lisa.c@jellycat.com', role: 'Support Agent', status: 'Away', tickets: 542, resolution: '88%', avgResponse: '15m', csat: '4.6' },
    { initials: 'JW', name: 'James Wilson', email: 'james.w@jellycat.com', role: 'Senior Agent', status: 'Offline', tickets: 756, resolution: '93%', avgResponse: '10m', csat: '4.8' },
    { initials: 'ED', name: 'Emily Davis', email: 'emily.d@jellycat.com', role: 'Support Agent', status: 'Online', tickets: 489, resolution: '87%', avgResponse: '13m', csat: '4.5' },
  ];

  return (
    <DashboardLayout title="Agents">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Agent Management</h1>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Unassigned Tickets */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Unassigned Tickets</h2>
            <span className="text-sm text-pink-500 font-medium">3 pending assignment</span>
          </div>

          {unassignedTickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between items-center bg-pink-100 rounded-xl p-4 mb-4">
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-700">{ticket.id}</span>
                  <span className={`ml-3 text-xs rounded-full px-2 py-1 ${ticket.priority === 'high' ? 'bg-pink-200 text-pink-700' : 'bg-gray-200 text-gray-700'}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="text-gray-800">{ticket.subject}</div>
                <div className="text-gray-500 text-sm">{ticket.customer}</div>
              </div>

              <div className="text-right">
                <div className="text-gray-400 text-sm mb-2">Waiting: {ticket.waitTime}</div>
                <button className="text-pink-500 text-sm font-medium hover:underline">
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Availability */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Agent Availability</h2>

          {agents.slice(0, 4).map((agent) => (
            <div key={agent.name} className="flex items-center mb-5">
              <div className="w-10 h-10 bg-pink-200 text-pink-700 font-bold flex items-center justify-center rounded-full mr-4">
                {agent.initials}
              </div>
              <div>
                <div className="text-gray-700 font-medium">{agent.name}</div>
                <div className="text-gray-400 text-sm">Current Load: 4 tickets</div>
              </div>
              <div className="ml-auto">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${agent.status === 'Online' ? 'bg-green-100 text-green-600' : agent.status === 'Away' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}>
                  {agent.status.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search agents..."
          className="w-full lg:w-1/3 border border-gray-300 rounded-lg py-2 px-4"
        />
        <div className="flex gap-4">
          <select className="border border-gray-300 rounded-lg py-2 px-4">
            <option>All Statuses</option>
            <option>Online</option>
            <option>Away</option>
            <option>Offline</option>
          </select>
          <select className="border border-gray-300 rounded-lg py-2 px-4">
            <option>All Roles</option>
            <option>Senior Agent</option>
            <option>Support Agent</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white p-6 rounded-2xl shadow">
        {agents.map((agent) => (
          <div key={agent.email} className="flex items-center py-4 border-b last:border-b-0">
            <div className="w-10 h-10 bg-pink-200 text-pink-700 font-bold flex items-center justify-center rounded-full mr-4">
              {agent.initials}
            </div>
            <div className="flex-1">
              <div className="text-gray-800 font-semibold">{agent.name}</div>
              <div className="text-gray-400 text-sm">{agent.email}</div>
            </div>
            <div className="w-32 text-gray-600">{agent.role}</div>
            <div className="w-20">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${agent.status === 'Online' ? 'bg-green-100 text-green-600' : agent.status === 'Away' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}>
                {agent.status}
              </span>
            </div>
            <div className="w-20 text-center">{agent.tickets}</div>
            <div className="w-20 text-center">{agent.resolution}</div>
            <div className="w-20 text-center">{agent.avgResponse}</div>
            <div className="w-20 text-center">{agent.csat}</div>
            <div className="w-24 text-right text-pink-400 font-medium hover:underline cursor-pointer">Actions</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AgentManagement;
