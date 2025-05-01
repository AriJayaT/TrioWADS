import React from 'react';

const AnalyticsOverview = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'resolution', name: 'Resolution Times' },
    { id: 'performance', name: 'Agent Performance' },
    { id: 'satisfaction', name: 'Satisfaction' },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Header with title and controls in its own box */}
      <div className="p-4 bg-white rounded-xl shadow-sm border border-pink-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Analytics Dashboard</h2>
          <div className="flex items-center gap-2">
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              defaultValue="this-week"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="custom">Custom</option>
            </select>
            <button className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation with box styling */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-2 font-medium text-sm rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-pink-600 bg-pink-50 border border-pink-200'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview; 