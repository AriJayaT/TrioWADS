import React from 'react';
import { FaUsers, FaTicketAlt, FaBolt, FaStar } from 'react-icons/fa';
import MetricCard from '../common/MetricCard';
import Button from '../common/Button';

const SystemOverview = () => {
  const metrics = [
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
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Overview</h1>
        <div className="flex gap-6">
          <Button variant='smallSubmit' size='md'>System Status</Button>
          <Button variant='smallSubmit' size='md'>Generate Report</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-lg hover:shadow-pink-200 p-4 transition-all"
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