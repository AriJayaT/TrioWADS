import React from 'react';

const reopenData = [
  { name: 'Sarah Anderson', rate: 2.1 },
  { name: 'Mike Thompson', rate: 3.2 },
  { name: 'Lisa Chen', rate: 2.8 },
  { name: 'James Wilson', rate: 3.5 },
  { name: 'Emily Davis', rate: 3.3 },
];

const TicketReopenRate = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket Reopen Rate</h2>
      <div className="space-y-4">
        {reopenData.map((agent, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-800 font-medium">{agent.name}</span>
              <span className="text-sm text-gray-500 font-medium">{agent.rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2.5">
              <div
                className="bg-pink-400 h-2.5 rounded-full"
                style={{ width: `${agent.rate * 25}%` }} // max at ~4.0%
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketReopenRate; 