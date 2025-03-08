import React from 'react';

const MetricCard = ({ icon, value, label, change, changeType = "positive" }) => {
  const getChangeColor = () => {
    if (!change) return '';
    return changeType === 'positive' ? 'text-green-500' : 'text-red-500';
  };

  const formatChange = () => {
    if (!change) return '';
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-yellow-300">
          {icon}
        </div>
        {change && (
          <div className={`text-xs font-medium ${getChangeColor()}`}>
            {formatChange()}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
};

export default MetricCard;