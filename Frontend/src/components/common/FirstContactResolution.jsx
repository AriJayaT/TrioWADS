import React from 'react';

const resolutionData = [
  { name: 'Sarah Anderson', score: 76 },
  { name: 'Mike Thompson', score: 72 },
  { name: 'Lisa Chen', score: 74 },
  { name: 'James Wilson', score: 70 },
  { name: 'Emily Davis', score: 71 },
];

const FirstContactResolution = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">First Contact Resolution</h2>
      <div className="space-y-4">
        {resolutionData.map((agent, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-800 font-medium">{agent.name}</span>
              <span className="text-sm text-gray-500 font-medium">{agent.score}%</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2.5">
              <div
                className="bg-pink-400 h-2.5 rounded-full"
                style={{ width: `${agent.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirstContactResolution; 