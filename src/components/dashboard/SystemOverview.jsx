import React, { useState, useEffect } from 'react';
import { FaUsers, FaTicketAlt, FaBolt, FaStar } from 'react-icons/fa';
import MetricCard from '../common/MetricCard';
import Button from '../common/Button';
import { useSocket } from '../../context/SocketContext';
import ticketService from '../../services/api/ticketService';

const SystemOverview = () => {
  const { socket, isConnected, subscribeToEvent, unsubscribeFromEvent } = useSocket();
  const [metrics, setMetrics] = useState([
    {
      icon: <FaUsers className="text-lg text-gray-500" />,
      value: '24/30',
      label: 'Active Agents',
      change: '+2',
      changeType: 'positive'
    },
    {
      icon: <FaTicketAlt className="text-lg text-orange-400" />,
      value: '847',
      label: 'Ticket Volume',
      change: '+12%',
      changeType: 'positive'
    },
    {
      icon: <FaBolt className="text-lg" />,
      value: '99.9%',
      label: 'System Response',
      change: '+0.1%',
      changeType: 'positive'
    },
    {
      icon: <FaStar className="text-lg" />,
      value: '4.8',
      label: 'Overall CSAT',
      change: '+0.2',
      changeType: 'positive'
    }
  ]);

  // Debug logging
  useEffect(() => {
    console.log('[SystemOverview] Socket connection status:', isConnected);
  }, [isConnected]);

  const fetchMetrics = async () => {
    try {
      console.log('[SystemOverview] Fetching metrics data...');
      const response = await ticketService.getTicketStats();
      console.log('[SystemOverview] Received metrics data:', response);
      if (response.success) {
        setMetrics([
          {
            icon: <FaUsers className="text-lg text-gray-500" />,
            value: `${response.stats.activeAgents || 0}/${response.stats.totalAgents || 0}`,
            label: 'Active Agents',
            change: response.stats.agentChange >= 0 ? `+${response.stats.agentChange}` : `${response.stats.agentChange}`,
            changeType: response.stats.agentChange >= 0 ? 'positive' : 'negative'
          },
          {
            icon: <FaTicketAlt className="text-lg text-orange-400" />,
            value: response.stats.total.toString(),
            label: 'Ticket Volume',
            change: response.stats.ticketVolumeChange >= 0 ? `+${response.stats.ticketVolumeChange}%` : `${response.stats.ticketVolumeChange}%`,
            changeType: response.stats.ticketVolumeChange >= 0 ? 'positive' : 'negative'
          },
          {
            icon: <FaBolt className="text-lg" />,
            value: `${response.stats.avgResponseTime || 0}%`,
            label: 'System Response',
            change: response.stats.responseTimeChange >= 0 ? `+${response.stats.responseTimeChange}%` : `${response.stats.responseTimeChange}%`,
            changeType: response.stats.responseTimeChange >= 0 ? 'positive' : 'negative'
          },
          {
            icon: <FaStar className="text-lg" />,
            value: response.stats.csatScore?.toFixed(1) || '0.0',
            label: 'Overall CSAT',
            change: response.stats.csatChange >= 0 ? `+${response.stats.csatChange}` : `${response.stats.csatChange}`,
            changeType: response.stats.csatChange >= 0 ? 'positive' : 'negative'
          }
        ]);
      }
    } catch (error) {
      console.error('[SystemOverview] Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    console.log('[SystemOverview] Setting up socket event handlers');
    fetchMetrics();

    // Subscribe to socket events
    const handleTicketUpdate = (data) => {
      console.log('[SystemOverview] Handling ticket update:', data);
      fetchMetrics();
    };

    const handleNewTicket = (data) => {
      console.log('[SystemOverview] Handling new ticket:', data);
      fetchMetrics();
    };

    const handleTicketResolved = (data) => {
      console.log('[SystemOverview] Handling ticket resolved:', data);
      fetchMetrics();
    };

    const handleAgentStatusChange = (data) => {
      console.log('[SystemOverview] Handling agent status change:', data);
      fetchMetrics();
    };

    const handleStatsUpdate = (stats) => {
      console.log('[SystemOverview] Handling stats update:', stats);
      setMetrics([
        {
          icon: <FaUsers className="text-lg text-gray-500" />,
          value: `${stats.activeAgents || 0}/${stats.totalAgents || 0}`,
          label: 'Active Agents',
          change: stats.agentChange >= 0 ? `+${stats.agentChange}` : `${stats.agentChange}`,
          changeType: stats.agentChange >= 0 ? 'positive' : 'negative'
        },
        {
          icon: <FaTicketAlt className="text-lg text-orange-400" />,
          value: stats.total.toString(),
          label: 'Ticket Volume',
          change: stats.ticketVolumeChange >= 0 ? `+${stats.ticketVolumeChange}%` : `${stats.ticketVolumeChange}%`,
          changeType: stats.ticketVolumeChange >= 0 ? 'positive' : 'negative'
        },
        {
          icon: <FaBolt className="text-lg" />,
          value: `${stats.avgResponseTime || 0}%`,
          label: 'System Response',
          change: stats.responseTimeChange >= 0 ? `+${stats.responseTimeChange}%` : `${stats.responseTimeChange}%`,
          changeType: stats.responseTimeChange >= 0 ? 'positive' : 'negative'
        },
        {
          icon: <FaStar className="text-lg" />,
          value: stats.csatScore?.toFixed(1) || '0.0',
          label: 'Overall CSAT',
          change: stats.csatChange >= 0 ? `+${stats.csatChange}` : `${stats.csatChange}`,
          changeType: stats.csatChange >= 0 ? 'positive' : 'negative'
        }
      ]);
    };

    // Subscribe to events
    console.log('[SystemOverview] Subscribing to socket events');
    subscribeToEvent('ticket_updated', handleTicketUpdate);
    subscribeToEvent('new_ticket', handleNewTicket);
    subscribeToEvent('ticket_resolved', handleTicketResolved);
    subscribeToEvent('agent_status_change', handleAgentStatusChange);
    subscribeToEvent('stats_updated', handleStatsUpdate);

    // Cleanup subscriptions
    return () => {
      console.log('[SystemOverview] Cleaning up socket event subscriptions');
      unsubscribeFromEvent('ticket_updated', handleTicketUpdate);
      unsubscribeFromEvent('new_ticket', handleNewTicket);
      unsubscribeFromEvent('ticket_resolved', handleTicketResolved);
      unsubscribeFromEvent('agent_status_change', handleAgentStatusChange);
      unsubscribeFromEvent('stats_updated', handleStatsUpdate);
    };
  }, [subscribeToEvent, unsubscribeFromEvent]);

  // Debug metrics updates
  useEffect(() => {
    console.log('[SystemOverview] Metrics updated:', metrics);
  }, [metrics]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">System Overview</h1>
        <div className="flex flex-wrap gap-3 sm:gap-6">
          <Button variant='smallSubmit' size='md'>System Status</Button>
          <Button variant='smallSubmit' size='md'>Generate Report</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-lg hover:shadow-pink-200 p-3 sm:p-4 transition-all"
          >
            <MetricCard
              key={index}
              icon={metric.icon}
              value={metric.value}
              label={metric.label}
              change={metric.change}
              changeType={metric.changeType}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemOverview;