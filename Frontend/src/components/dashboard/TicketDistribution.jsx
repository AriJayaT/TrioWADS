import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaExclamationCircle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import ticketService from '../../services/api/ticketService';

const TicketDistribution = () => {
  const [distribution, setDistribution] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  // Debug logging
  useEffect(() => {
    console.log('[TicketDistribution] Socket connection status:', isConnected);
  }, [isConnected]);

  const fetchTicketDistribution = async () => {
    try {
      console.log('[TicketDistribution] Fetching ticket distribution data...');
      setLoading(true);
      const response = await ticketService.getTicketDistribution();
      console.log('[TicketDistribution] Received ticket distribution data:', response);
      if (response.success) {
        setDistribution(response.distribution);
      }
    } catch (error) {
      console.error('[TicketDistribution] Error fetching ticket distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[TicketDistribution] Socket not connected, skipping event handlers');
      return;
    }

    console.log('[TicketDistribution] Setting up socket event handlers');
    fetchTicketDistribution();

    // Subscribe to socket events
    const handleTicketUpdate = (data) => {
      console.log('[TicketDistribution] Handling ticket update:', data);
      fetchTicketDistribution();
    };

    const handleNewTicket = (data) => {
      console.log('[TicketDistribution] Handling new ticket:', data);
      fetchTicketDistribution();
    };

    const handleTicketResolved = (data) => {
      console.log('[TicketDistribution] Handling ticket resolved:', data);
      fetchTicketDistribution();
    };

    // Subscribe to events
    console.log('[TicketDistribution] Subscribing to socket events');
    socket.on('ticket_updated', handleTicketUpdate);
    socket.on('new_ticket', handleNewTicket);
    socket.on('ticket_resolved', handleTicketResolved);

    // Cleanup subscriptions
    return () => {
      console.log('[TicketDistribution] Cleaning up socket event subscriptions');
      try {
        if (socket) {
          socket.off('ticket_updated', handleTicketUpdate);
          socket.off('new_ticket', handleNewTicket);
          socket.off('ticket_resolved', handleTicketResolved);
        }
      } catch (error) {
        console.error('[TicketDistribution] Error cleaning up socket events:', error);
      }
    };
  }, [socket, isConnected]);

  // Debug distribution updates
  useEffect(() => {
    console.log('[TicketDistribution] Distribution updated:', distribution);
  }, [distribution]);

  if (loading) {
    console.log('[TicketDistribution] Rendering loading state');
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('[TicketDistribution] Rendering with distribution:', distribution);

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  const getPercentage = (value) => {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Ticket Distribution</h2>
      
      <div className="space-y-4">
        {/* Open Tickets */}
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaTicketAlt className="text-red-500" />
            <span className="text-gray-700">Open</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">{distribution.open}</span>
            <span className="text-sm text-gray-500">
              ({getPercentage(distribution.open)}%)
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaClock className="text-yellow-500" />
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">{distribution.inProgress}</span>
            <span className="text-sm text-gray-500">
              ({getPercentage(distribution.inProgress)}%)
            </span>
          </div>
        </div>

        {/* Resolved */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaCheckCircle className="text-green-500" />
            <span className="text-gray-700">Resolved</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">{distribution.resolved}</span>
            <span className="text-sm text-gray-500">
              ({getPercentage(distribution.resolved)}%)
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaExclamationCircle className="text-blue-500" />
            <span className="text-gray-700">Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">{distribution.pending}</span>
            <span className="text-sm text-gray-500">
              ({getPercentage(distribution.pending)}%)
            </span>
          </div>
        </div>

        {/* Closed */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaCheckCircle className="text-gray-500" />
            <span className="text-gray-700">Closed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">{distribution.closed}</span>
            <span className="text-sm text-gray-500">
              ({getPercentage(distribution.closed)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDistribution;