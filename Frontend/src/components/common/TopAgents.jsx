import React from "react";
import { FaStar, FaTicketAlt, FaClock } from 'react-icons/fa';

const TopAgents = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-bold text-black mb-4">Top Performing Agents</h2>
        <div className="text-center py-8 text-gray-500">
          <FaTicketAlt className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p className="text-sm">No agents have resolved tickets yet</p>
          <p className="text-xs mt-1">Performance data will appear once agents start resolving tickets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-bold text-black mb-4">Top Performing Agents</h2>
      <div className="space-y-4">
        {data.map((agent, index) => (
          <div key={agent._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                {agent.profileImage ? (
                  <img 
                    src={agent.profileImage} 
                    alt={agent.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // On error, replace with initials
                      const parent = e.target.parentElement;
                      parent.className = 'w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white font-medium text-sm';
                      parent.innerHTML = agent.name?.charAt(0)?.toUpperCase() || 'A';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{agent.name || 'Unknown Agent'}</p>
                <p className="text-sm text-gray-500">
                  {agent.resolvedTickets || 0} tickets resolved
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-yellow-500 mb-1">
                <FaStar className="w-3 h-3 mr-1" />
                <span className="text-sm font-medium">
                  {agent.avgRating ? agent.avgRating.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center text-gray-500">
                <FaClock className="w-3 h-3 mr-1" />
                <span className="text-xs">
                  {agent.avgResolutionTime ? `${agent.avgResolutionTime}m` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopAgents; 