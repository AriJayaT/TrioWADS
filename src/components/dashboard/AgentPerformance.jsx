import React, { useState, useEffect } from 'react';
import { FaUser, FaCheckCircle, FaClock, FaStar } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import ticketService from '../../services/api/ticketService';

const AgentPerformance = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected, subscribeToEvent, unsubscribeFromEvent } = useSocket();

  // Debug logging
  useEffect(() => {
    console.log('[AgentPerformance] Socket connection status:', isConnected);
  }, [isConnected]);

  const fetchAgentPerformance = async () => {
    try {
      console.log('[AgentPerformance] Fetching agent performance data...');
      setLoading(true);
      const response = await ticketService.getAgentPerformance();
      console.log('[AgentPerformance] Received agent performance data:', response);
      if (response.success) {
        setAgents(response.agents);
      }
    } catch (error) {
      console.error('[AgentPerformance] Error fetching agent performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    // Subscribe to events
    console.log('[AgentPerformance] Subscribing to socket events');
    subscribeToEvent('ticket_updated', handleTicketUpdate);
    subscribeToEvent('ticket_assigned', handleTicketAssigned);
    subscribeToEvent('ticket_resolved', handleTicketResolved);

    // Cleanup subscriptions
    return () => {
      console.log('[AgentPerformance] Cleaning up socket event subscriptions');
      unsubscribeFromEvent('ticket_updated', handleTicketUpdate);
      unsubscribeFromEvent('ticket_assigned', handleTicketAssigned);
      unsubscribeFromEvent('ticket_resolved', handleTicketResolved);
    };
  }, [subscribeToEvent, unsubscribeFromEvent]);

  // Debug agents updates
  useEffect(() => {
    console.log('[AgentPerformance] Agents updated:', agents);
  }, [agents]);

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

  console.log('[AgentPerformance] Rendering with agents:', agents);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Agent Performance</h2>
      
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <FaUser className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.role}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <FaCheckCircle className="text-green-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="font-semibold text-gray-800">{agent.resolvedTickets}</p>
              </div>
              
              <div className="text-center">
                <FaClock className="text-blue-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Avg. Time</p>
                <p className="font-semibold text-gray-800">{agent.avgResponseTime}m</p>
              </div>
              
              <div className="text-center">
                <FaStar className="text-yellow-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-semibold text-gray-800">{agent.rating}/5</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentPerformance;