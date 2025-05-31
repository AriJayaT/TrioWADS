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
        if (json.success && json.metrics) {
          setMetrics(json.metrics);
        } else {
          setError("Failed to load overview metrics");
        }
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
      icon: <FaUsers className="text-2xl text-blue-500" />,
      value: metrics.activeAgents,
      label: 'Active Agents',
      change: '+1',
      changeType: 'positive',
      metricType: 'tickets'
    },
    {
      icon: <FaTicketAlt className="text-2xl text-purple-500" />,
      value: metrics.ticketVolume,
      label: 'Ticket Volume',
      change: '+12%',
      changeType: 'positive',
      metricType: 'ticketCount'
    },
    {
      icon: <FaBolt className="text-2xl text-yellow-500" />,
      value: metrics.systemResponse,
      label: 'System Response',
      change: '+0.1%',
      changeType: 'positive',
      metricType: 'response'
    },
    {
      icon: <FaStar className="text-2xl text-orange-500" />,
      value: metrics.overallCSAT,
      label: 'Overall CSAT',
      change: '+0.2',
      changeType: 'positive',
      metricType: 'satisfaction'
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">System Overview</h1>
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
              metricType={metric.metricType}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemOverview;
