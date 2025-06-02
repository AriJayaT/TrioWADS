import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import ticketService from '../../services/api/ticketService';

const AgentPerformance = () => {
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to generate consistent colors based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-pink-100 text-pink-600',
      'bg-blue-100 text-blue-600', 
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-indigo-100 text-indigo-600',
      'bg-red-100 text-red-600',
      'bg-gray-100 text-gray-600'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Debug logging
  useEffect(() => {
    console.log('[AgentPerformance] Socket connection status:', isConnected);
  }, [isConnected]);

  const fetchAgentPerformance = async () => {
    try {
      console.log('[AgentPerformance] Fetching agent performance data...');
      setLoading(true);
      const response = await ticketService.getTicketStats();
      console.log('[AgentPerformance] Received stats data:', response);
      if (response.success && response.stats.agentPerformance) {
        setAgentPerformance(response.stats.agentPerformance);
      }
    } catch (error) {
      console.error('[AgentPerformance] Error fetching agent performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[AgentPerformance] Socket not connected, skipping event handlers');
      return;
    }

    console.log('[AgentPerformance] Setting up socket event handlers');
    fetchAgentPerformance();

    // Subscribe to socket events
    const handleTicketUpdate = (data) => {
      console.log('[AgentPerformance] Handling ticket update:', data);
      fetchAgentPerformance();
    };

    const handleTicketAssigned = (data) => {
      console.log('[AgentPerformance] Handling ticket assigned:', data);
      fetchAgentPerformance();
    };

    const handleTicketResolved = (data) => {
      console.log('[AgentPerformance] Handling ticket resolved:', data);
      fetchAgentPerformance();
    };

    const handleStatsUpdate = (data) => {
      console.log('[AgentPerformance] Handling stats update:', data);
      if (data.agentPerformance) {
        setAgentPerformance(data.agentPerformance);
      }
    };

    // Subscribe to events with safety check
    try {
      socket.on('ticket_updated', handleTicketUpdate);
      socket.on('ticket_assigned', handleTicketAssigned);
      socket.on('ticket_resolved', handleTicketResolved);
      socket.on('stats_updated', handleStatsUpdate);
    } catch (error) {
      console.error('[AgentPerformance] Error subscribing to socket events:', error);
    }

    // Cleanup subscriptions
    return () => {
      console.log('[AgentPerformance] Cleaning up socket event subscriptions');
      try {
        if (socket) {
          socket.off('ticket_updated', handleTicketUpdate);
          socket.off('ticket_assigned', handleTicketAssigned);
          socket.off('ticket_resolved', handleTicketResolved);
          socket.off('stats_updated', handleStatsUpdate);
        }
      } catch (error) {
        console.error('[AgentPerformance] Error cleaning up socket events:', error);
      }
    };
  }, [socket, isConnected]);

  // Debug agent performance updates
  useEffect(() => {
    console.log('[AgentPerformance] Agent performance updated:', agentPerformance);
  }, [agentPerformance]);

  if (loading) {
    console.log('[AgentPerformance] Rendering loading state');
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('[AgentPerformance] Rendering with agent performance:', agentPerformance);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Agent Performance</h2>
      
      {agentPerformance.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-medium">No agents have resolved tickets yet</p>
            <p className="text-xs mt-1">Performance data will appear once agents start resolving tickets</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {agentPerformance.map((agent) => (
            <div key={agent._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                {/* Avatar with profile image or initials */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden">
                  {agent.profileImage ? (
                    <img
                      src={agent.profileImage}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // On error, replace with initials
                        const parent = e.target.parentElement;
                        parent.className = `w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(agent.name)}`;
                        parent.innerHTML = getInitials(agent.name);
                      }}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(agent.name)}`}>
                      {getInitials(agent.name)}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-gray-500">Support Agent</p>
                </div>
              </div>

              <div className="flex items-center space-x-8 text-sm">
                {/* Tickets info */}
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {agent.resolvedTickets || 0}/{agent.totalTickets || 0} tickets
                  </div>
                  <div className="text-xs text-gray-500">Resolved/Total</div>
                </div>
                
                {/* Resolution Rate */}
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {Math.round(agent.resolutionRate || 0)}%
                  </div>
                  <div className="text-xs text-gray-500">Resolution Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentPerformance;