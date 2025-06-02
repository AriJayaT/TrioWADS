import React from 'react';

const FirstContactResolution = ({ data = [], timeRange = 'this-week' }) => {
  console.log('[FirstContactResolution] Received data:', data);
  
  // Calculate first contact resolution rate for each agent using real FCR data
  const agentResolutionData = data.map(agent => ({
    name: agent.name,
    // Use real FCR calculation from backend
    score: agent.firstContactResolutionRate || 0,
    // Additional details for debugging/tooltips
    firstContactResolutions: agent.firstContactResolutions || 0,
    ticketsWithAgentReplies: agent.ticketsWithAgentReplies || 0,
    totalTickets: agent.totalTickets || 0
  })).filter(agent => agent.ticketsWithAgentReplies > 0); // Only show agents who have replied to tickets

  console.log('[FirstContactResolution] Processed agent data:', agentResolutionData);

  // If no data available, show empty state
  if (agentResolutionData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">First Contact Resolution</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500 text-sm">No agents have replied to tickets yet in {timeRange}</p>
          <p className="text-gray-400 text-xs mt-1">FCR tracks tickets resolved without follow-up customer replies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">First Contact Resolution</h2>
      </div>
      <div className="space-y-4">
        {agentResolutionData.slice(0, 5).map((agent, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-800 font-medium">{agent.name}</span>
              <div className="text-right">
                <span className="text-sm text-gray-700 font-medium">{agent.score}%</span>
                <div className="text-xs text-gray-500">
                  {agent.firstContactResolutions}/{agent.ticketsWithAgentReplies} tickets
                </div>
              </div>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2.5">
              <div
                className="bg-pink-400 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, agent.score)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      {agentResolutionData.length === 0 && (
        <p className="text-center text-gray-500 text-sm mt-4">
          No agent performance data available for the selected time period.
        </p>
      )}
    </div>
  );
};

export default FirstContactResolution; 