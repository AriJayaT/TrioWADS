import React, { useState, useEffect } from 'react';
import { FaUserTie, FaInbox, FaStopwatch, FaHeart } from 'react-icons/fa';
import MetricCard from '../common/MetricCard';
import Button from '../common/Button';
import { useSocket } from '../../context/SocketContext';
import apiClient from '../../services/api/apiClient';

const SystemOverview = () => {
  const { socket, isConnected, subscribeToEvent, unsubscribeFromEvent } = useSocket();
  const [metrics, setMetrics] = useState([
    {
      icon: <FaUserTie className="text-lg text-blue-500" />,
      value: '0',
      label: 'Total Agents'
    },
    {
      icon: <FaInbox className="text-lg text-orange-400" />,
      value: '0',
      label: 'Ticket Volume'
    },
    {
      icon: <FaStopwatch className="text-lg text-green-500" />,
      value: '0m',
      label: 'Avg Response Time'
    },
    {
      icon: <FaHeart className="text-lg text-pink-500" />,
      value: '0.0',
      label: 'Overall CSAT'
    }
  ]);

  // Debug logging
  useEffect(() => {
    console.log('[SystemOverview] Socket connection status:', isConnected);
  }, [isConnected]);

  const fetchMetrics = async () => {
    try {
      console.log('[SystemOverview] Fetching metrics data...');
      // Request all-time data by using a very wide date range or special parameter
      const response = await apiClient.get('/tickets/stats', {
        params: { timeRange: 'all-time' } // Request all-time data instead of default 'this-week'
      });
      console.log('[SystemOverview] Received metrics data:', response);
      if (response.data.success) {
        // Calculate team average response time using the EXACT same method as Agent Performance tab
        const teamAvgResponseTime = response.data.stats.agentPerformance.length > 0 
          ? Math.round(response.data.stats.agentPerformance.reduce((sum, agent) => sum + (agent.avgResponseTime || 0), 0) / response.data.stats.agentPerformance.length)
          : 0;
        
        setMetrics([
          {
            icon: <FaUserTie className="text-lg text-blue-500" />,
            value: (response.data.stats.totalAgents || 0).toString(),
            label: 'Total Agents'
          },
          {
            icon: <FaInbox className="text-lg text-orange-400" />,
            value: response.data.stats.total.toString(),
            label: 'Ticket Volume'
          },
          {
            icon: <FaStopwatch className="text-lg text-green-500" />,
            value: `${teamAvgResponseTime}m`,
            label: 'Avg Response Time'
          },
          {
            icon: <FaHeart className="text-lg text-pink-500" />,
            value: response.data.stats.csatScore?.toFixed(1) || '0.0',
            label: 'Overall CSAT'
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
      
      // Calculate team average response time using the EXACT same method as Agent Performance tab
      const teamAvgResponseTime = stats.agentPerformance.length > 0 
        ? Math.round(stats.agentPerformance.reduce((sum, agent) => sum + (agent.avgResponseTime || 0), 0) / stats.agentPerformance.length)
        : 0;
      
      setMetrics([
        {
          icon: <FaUserTie className="text-lg text-blue-500" />,
          value: (stats.totalAgents || 0).toString(),
          label: 'Total Agents'
        },
        {
          icon: <FaInbox className="text-lg text-orange-400" />,
          value: stats.total.toString(),
          label: 'Ticket Volume'
        },
        {
          icon: <FaStopwatch className="text-lg text-green-500" />,
          value: `${teamAvgResponseTime}m`,
          label: 'Avg Response Time'
        },
        {
          icon: <FaHeart className="text-lg text-pink-500" />,
          value: stats.csatScore?.toFixed(1) || '0.0',
          label: 'Overall CSAT'
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemOverview;