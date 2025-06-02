import React, { useState } from 'react';
import { exportAnalyticsToPDF } from '../../utils/pdfExport';

const AnalyticsOverview = ({ activeTab, setActiveTab, timeRange, setTimeRange, analyticsData }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'resolution', name: 'Resolution Times' },
    { id: 'performance', name: 'Agent Performance' },
    { id: 'satisfaction', name: 'Satisfaction' },
  ];

  const handleExportReport = async () => {
    if (!analyticsData) {
      alert('No data available to export. Please wait for the analytics data to load.');
      return;
    }

    setIsExporting(true);
    
    try {
      await exportAnalyticsToPDF(analyticsData, null, timeRange);
      
      // Show success message
      const exportMessage = `Successfully exported comprehensive analytics report for ${formatTimeRangeDisplay(timeRange)}`;
      console.log(exportMessage);
      
      // Optional: You could add a toast notification here instead of alert
      // For now, we'll keep it subtle with just console logging
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatTimeRangeDisplay = (range) => {
    switch (range) {
      case 'today': return 'Today';
      case 'this-week': return 'This Week';
      case 'this-month': return 'This Month';
      default: return range;
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Header with title and controls in its own box */}
      <div className="p-4 bg-white rounded-xl shadow-sm border border-pink-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Analytics Dashboard</h2>
          <div className="flex items-center gap-2">
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
            <button 
              onClick={handleExportReport}
              disabled={isExporting || !analyticsData}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                isExporting || !analyticsData
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Exporting...
                </span>
              ) : (
                'Export Report'
              )}
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