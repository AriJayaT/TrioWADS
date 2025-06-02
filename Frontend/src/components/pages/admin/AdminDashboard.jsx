import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layout/DashboardLayout';
import SystemOverview from '../../dashboard/SystemOverview';
import AgentPerformance from '../../dashboard/AgentPerformance';
import TicketDistribution from '../../dashboard/TicketDistribution';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/api/ticketService';

const AdminDashboard = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0
  });

  // Debug logging
  useEffect(() => {
    console.log('[AdminDashboard] Socket connection status:', isConnected);
    console.log('[AdminDashboard] Current user:', user);
  }, [isConnected, user]);

  const fetchDashboardData = async () => {
    try {
      console.log('[AdminDashboard] Fetching dashboard data...');
      setLoading(true);
      const response = await ticketService.getTicketStats();
      console.log('[AdminDashboard] Received ticket stats:', response);
      if (response.success) {
        setMetrics(response.stats);
      }
    } catch (err) {
      console.error('[AdminDashboard] Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AdminDashboard] Setting up socket event handlers');
    fetchDashboardData();

    // Don't set up socket events if socket is not available
    if (!socket || !isConnected) {
      console.log('[AdminDashboard] Socket not available, skipping event handlers');
      return;
    }

    // Subscribe to socket events
    const handleTicketUpdate = (data) => {
      console.log('[AdminDashboard] Handling ticket update:', data);
      fetchDashboardData(); // Refresh metrics when a ticket is updated
    };

    const handleNewTicket = (data) => {
      console.log('[AdminDashboard] Handling new ticket:', data);
      fetchDashboardData(); // Refresh metrics when a new ticket is created
    };

    const handleTicketAssigned = (data) => {
      console.log('[AdminDashboard] Handling ticket assigned:', data);
      fetchDashboardData(); // Refresh metrics when a ticket is assigned
    };

    const handleTicketEscalated = (data) => {
      console.log('[AdminDashboard] Handling ticket escalated:', data);
      fetchDashboardData(); // Refresh metrics when a ticket is escalated
    };

    // Subscribe to events with safety check
    try {
      console.log('[AdminDashboard] Subscribing to socket events');
      socket.on('ticket_updated', handleTicketUpdate);
      socket.on('new_ticket', handleNewTicket);
      socket.on('ticket_assigned', handleTicketAssigned);
      socket.on('ticket_escalated', handleTicketEscalated);
    } catch (error) {
      console.error('[AdminDashboard] Error subscribing to socket events:', error);
    }

    // Cleanup subscriptions
    return () => {
      console.log('[AdminDashboard] Cleaning up socket event subscriptions');
      try {
        if (socket) {
          socket.off('ticket_updated', handleTicketUpdate);
          socket.off('new_ticket', handleNewTicket);
          socket.off('ticket_assigned', handleTicketAssigned);
          socket.off('ticket_escalated', handleTicketEscalated);
        }
      } catch (error) {
        console.error('[AdminDashboard] Error cleaning up socket events:', error);
      }
    };
  }, [socket, isConnected]);

  // Debug metrics updates
  useEffect(() => {
    console.log('[AdminDashboard] Metrics updated:', metrics);
  }, [metrics]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <SystemOverview metrics={metrics} loading={loading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <AgentPerformance />
          </div>
          <div>
            <TicketDistribution />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;