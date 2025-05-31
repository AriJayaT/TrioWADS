import React from 'react';
import { 
  FaBolt, 
  FaChartLine, 
  FaRegClock, 
  FaStar, 
  FaTicketAlt, 
  FaCheckCircle 
} from 'react-icons/fa';

// Map metric types to their icons
const iconMap = {
  'resolution': <FaBolt className="text-yellow-400" />,
  'response': <FaRegClock className="text-red-400" />,
  'satisfaction': <FaStar className="text-yellow-400" />,
  'tickets': <FaChartLine className="text-blue-400" />,
  'sla': <FaCheckCircle className="text-green-500" />,
  'ticketCount': <FaTicketAlt className="text-blue-400" />
};

const MetricCard = ({ 
  icon, // The icon component to display
  value, // The main metric value
  label, // Description of the metric
  change, // Trend value (with + or - sign)
  changeType = 'positive', // Whether the trend direction is positive
  metricType = 'default' // Type of metric (used for border color)
}) => {
  // Determine if the trend is positive, negative or neutral
  const getTrendClass = () => {
    if (!change) return 'text-gray-400';
    return changeType === 'positive' ? 'text-green-500' : 'text-red-500';
  };

  // Get border color based on metric type
  const getBorderColor = () => {
    switch(metricType) {
      case 'resolution': return 'border-yellow-200';
      case 'response': return 'border-red-200';
      case 'satisfaction': return 'border-yellow-200';
      case 'tickets': return 'border-blue-200';
      case 'sla': return 'border-green-200';
      case 'ticketCount': return 'border-blue-200';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border ${getBorderColor()}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="text-xl">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium ${getTrendClass()}`}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-1">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default MetricCard;