import React from 'react';

const tickets = [
  {
    id: 'TK-2024-007',
    priority: 'high',
    subject: 'Missing Order Confirmation',
    name: 'Robert Miller',
    waiting: '45m',
  },
  {
    id: 'TK-2024-008',
    priority: 'normal',
    subject: 'Product Size Question',
    name: 'Alice Johnson',
    waiting: '30m',
  },
  {
    id: 'TK-2024-009',
    priority: 'high',
    subject: 'Billing Discrepancy',
    name: 'David Lee',
    waiting: '1h',
  },
];

const getPriorityStyle = (priority) => {
  return priority === 'high'
    ? 'bg-red-100 text-red-500'
    : 'bg-pink-100 text-pink-400';
};

const UnassignedTickets = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-200">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Unassigned Tickets</h2>
        <span className="text-sm text-red-500 font-medium">3 pending assignment</span>
      </div>
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="border border-pink-100 p-4 rounded-xl mb-3 flex flex-col gap-1"
        >
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold">{ticket.id}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
          <div className="text-gray-800 font-medium">{ticket.subject}</div>
          <div className="text-sm text-gray-500">{ticket.name}</div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-400">Waiting: {ticket.waiting}</div>
            <button className="text-sm text-pink-400 bg-pink-50 px-4 py-1 rounded-md cursor-pointer">
              Assign
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnassignedTickets; 