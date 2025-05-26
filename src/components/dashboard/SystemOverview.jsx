import React, { useEffect, useState } from 'react';
import { FaUsers, FaTicketAlt, FaBolt, FaStar } from 'react-icons/fa';
import MetricCard from '../common/MetricCard';
import Button from '../common/Button';

const SystemOverview = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/analytics/system-overview", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) setMetrics(json.metrics);
        else setError("Failed to load overview metrics");
      })
      .catch(err => {
        console.error("System overview fetch failed", err);
        setError("Something went wrong");
      });
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!metrics) return <p className="text-gray-500">Loading overview...</p>;

  const metricItems = [
    {
      icon: <FaUsers className="text-lg text-gray-500" />,
      value: metrics.activeAgents,
      label: 'Active Agents',
      change: '+2', // Optional: you can add logic for real change
      changeType: 'positive'
    },
    {
      icon: <FaTicketAlt className="text-lg text-orange-400" />,
      value: metrics.ticketVolume,
      label: 'Ticket Volume',
      change: '+12%',
      changeType: 'positive'
    },
    {
      icon: <FaBolt className="text-lg" />,
      value: metrics.systemResponse,
      label: 'System Response',
      change: '+0.1%',
      changeType: 'positive'
    },
    {
      icon: <FaStar className="text-lg" />,
      value: metrics.overallCSAT,
      label: 'Overall CSAT',
      change: '+0.2',
      changeType: 'positive'
    }
  ];

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
        {metricItems.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg hover:shadow-pink-200 p-3 sm:p-4 transition-all"
          >
            <MetricCard
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
