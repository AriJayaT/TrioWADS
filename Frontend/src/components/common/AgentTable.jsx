import React, { useState } from 'react';

const statusStyles = {
  online: 'bg-green-100 text-green-500',
  away: 'bg-yellow-100 text-yellow-500',
  offline: 'bg-red-100 text-red-500',
  active: 'bg-green-100 text-green-500',
  inactive: 'bg-red-100 text-red-500',
};

const AgentTable = ({ agents = [], onAgentAction }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesRole = roleFilter === 'all' || agent.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAction = (action, agent) => {
    setOpenDropdown(null);
    if (onAgentAction) {
      onAgentAction(action, agent);
    }
  };

  if (!agents || agents.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-100">
        <div className="text-center py-8 text-gray-500">
          No agents available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-100 relative">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium border-none outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium border-none outline-none"
          >
            <option value="all">All Roles</option>
            <option value="agent">Agent</option>
            <option value="senior">Senior Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Agent Rows */}
      {filteredAgents.map((agent, idx) => (
        <div
          key={agent._id || idx}
          className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 mb-4 border border-pink-100 rounded-xl gap-3"
        >
          <div className="flex items-center gap-4 w-full sm:w-1/3">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              {agent.name ? agent.name.split(' ').map(n => n[0]).join('') : '??'}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{agent.name || 'Unknown'}</div>
              <div className="text-sm text-gray-500">{agent.email || 'No email'}</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 w-full sm:w-1/6">
            {agent.role?.charAt(0).toUpperCase() + agent.role?.slice(1) || 'Agent'}
          </div>

          <div className="w-full sm:w-1/6">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusStyles[agent.status] || statusStyles.offline}`}>
              {agent.status?.charAt(0).toUpperCase() + agent.status?.slice(1) || 'Unknown'}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 w-full sm:w-1/3">
            <div>
              <div className="font-semibold">{agent.assignedTickets || 0}</div>
              <div className="text-xs text-gray-400">Tickets</div>
            </div>
            <div>
              <div className="font-semibold">{agent.resolutionRate ? `${agent.resolutionRate.toFixed(0)}%` : '0%'}</div>
              <div className="text-xs text-gray-400">Resolution</div>
            </div>
            <div>
              <div className="font-semibold">{agent.avgResponseTime ? `${agent.avgResponseTime}m` : '0m'}</div>
              <div className="text-xs text-gray-400">Avg Response</div>
            </div>
            <div>
              <div className="font-semibold">{agent.avgRating ? agent.avgRating.toFixed(1) : '0.0'}</div>
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
                <div 
                  className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer"
                  onClick={() => handleAction('view-performance', agent)}
                >
                  View Performance
                </div>
                <div 
                  className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer"
                  onClick={() => handleAction('edit-profile', agent)}
                >
                  Edit Profile
                </div>
                <div 
                  className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer"
                  onClick={() => handleAction('manage-access', agent)}
                >
                  Manage Access
                </div>
                <div 
                  className="px-4 py-2 text-gray-700 hover:bg-pink-50 rounded-md cursor-pointer"
                  onClick={() => handleAction('reset-password', agent)}
                >
                  Reset Password
                </div>
                <div 
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
                  onClick={() => handleAction('deactivate', agent)}
                >
                  {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {filteredAgents.length === 0 && agents.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No agents match your search criteria
        </div>
      )}
    </div>
  );
};

export default AgentTable; 