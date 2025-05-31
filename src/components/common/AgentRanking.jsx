import React, { useEffect, useState } from 'react';
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';

const AgentRanking = () => {
  const [agents, setAgents] = useState([]);
  const [sortKey, setSortKey] = useState('tickets');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const convertResolutionTimeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === 'N/A') return Number.MAX_SAFE_INTEGER;
    const [hours, minutes] = timeStr.split('h ').map(part => parseInt(part));
    const totalMinutes = (hours * 60) + (parseInt(minutes) || 0);
    // If total time is 0, treat it as no resolution time
    return totalMinutes === 0 ? Number.MAX_SAFE_INTEGER : totalMinutes;
  };

  const fetchAgentData = async (agent) => {
    try {
      const ratingsRes = await axios.get(`http://localhost:5000/api/tickets/agent/${agent.id}/ratings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return ratingsRes.data?.data?.averageRating || 0;
    } catch (err) {
      console.error(`Failed to fetch ratings for agent ${agent.id}:`, err);
      return 0;
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/agents', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Fetch ratings for each agent
      const agentsWithRatings = await Promise.all((res.data?.agents || []).map(async (agent) => {
        const rating = await fetchAgentData(agent);
        
        // Calculate trend based on reopen rate
        const reopenRate = parseFloat(agent.stats?.reopenRate?.replace('%', '') || 0);
        const trend = reopenRate <= 10 ? 'up' : 'down'; // Consider trend up if reopen rate is 10% or less

        // Get the resolution time in minutes
        const resolutionTimeStr = agent.stats?.avgResolutionTime || '0h 0m';
        const responseTime = convertResolutionTimeToMinutes(resolutionTimeStr);

        // Count only resolved/closed tickets
        const resolvedTickets = (agent.assignedTickets || []).filter(
          ticket => ticket.status === 'resolved' || ticket.status === 'closed'
        ).length;

        return {
          id: agent.id,
          name: agent.name,
          role: agent.agentType || 'Support Agent',
          initials: agent.name?.split(' ').map(n => n[0]).join('') || '??',
          tickets: resolvedTickets,
          avgResolution: resolutionTimeStr,
          responseTime,
          rating: parseFloat(rating).toFixed(1),
          sla: parseInt(agent.stats?.resolution?.replace('%', '') || '0'),
          fcr: parseInt(agent.stats?.firstContactResolution?.replace('%', '') || '0'),
          trend,
        };
      }));

      setAgents(agentsWithRatings);
    } catch (err) {
      console.error('Fetch failed:', err.response?.status, err.response?.data || err.message);
      setError('Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const sortedAgents = [...agents].sort((a, b) => {
    switch (sortKey) {
      case 'responseTime':
        // For response time, we want to show actual times first, then "no time" entries
        if (a[sortKey] === Number.MAX_SAFE_INTEGER && b[sortKey] === Number.MAX_SAFE_INTEGER) {
          // If both have no time, sort by number of tickets instead
          return b.tickets - a.tickets;
        }
        return a[sortKey] - b[sortKey];
      case 'rating':
        return b[sortKey] - a[sortKey];
      case 'sla':
        return b[sortKey] - a[sortKey];
      case 'fcr':
        return b[sortKey] - a[sortKey];
      default: // tickets
        return b[sortKey] - a[sortKey];
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Agent Rankings</h2>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="tickets">Resolved Tickets</option>
          <option value="rating">Satisfaction Level</option>
          <option value="responseTime">Response Time</option>
          <option value="sla">SLA</option>
          <option value="fcr">First Contact Resolution</option>
        </select>
      </div>

      <div className="space-y-4">
        {sortedAgents.map((agent, idx) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-4 rounded-xl border border-pink-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 font-bold flex items-center justify-center">
                {agent.initials}
              </div>
              <div>
                <div className="font-semibold text-black">{agent.name}</div>
                <div className="text-sm text-gray-500">{agent.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="text-right">
                <div className="font-medium">{agent.tickets} resolved</div>
                <div className="text-xs text-gray-400">{agent.avgResolution} avg</div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="font-medium">{agent.rating}</span>
                  <FaStar className="text-pink-400 text-xs" />
                </div>
                <div className="text-xs text-gray-400">{agent.fcr}% FCR</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{agent.sla}%</div>
                <div className="text-xs text-gray-400">SLA</div>
              </div>
              <div>
                {agent.trend === 'up' ? (
                  <FaArrowUp className="text-green-500" />
                ) : (
                  <FaArrowDown className="text-red-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentRanking;