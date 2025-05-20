import React from "react";

const agents = [
  {
    initials: "SA",
    name: "Sarah Anderson",
    ticketsResolved: 284,
    avgResolution: "1h 20m",
    rating: 4.9,
  },
  {
    initials: "MT",
    name: "Mike Thompson",
    ticketsResolved: 256,
    avgResolution: "1h 45m",
    rating: 4.7,
  },
  {
    initials: "LC",
    name: "Lisa Chen",
    ticketsResolved: 242,
    avgResolution: "1h 30m",
    rating: 4.8,
  },
];

const TopAgents = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full h-full min-h-[420px]">
      <h2 className="text-lg font-semibold mb-4">Top Performing Agents</h2>
      {agents.map((agent, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-4 mb-2 border rounded-xl border-pink-100"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center mr-4">
              {agent.initials}
            </div>
            <div>
              <div className="font-semibold">{agent.name}</div>
              <div className="text-sm text-gray-400">
                {agent.ticketsResolved} tickets resolved
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{agent.avgResolution}</div>
            <div className="text-xs text-gray-400">Avg Resolution</div>
          </div>
          <div className="text-pink-500 font-semibold ml-4">
            {agent.rating} ★
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopAgents; 