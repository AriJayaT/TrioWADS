import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

const CustomerHome = () => {
  const [tickets] = useState([
    {
      id: 'TK-2024-001',
      subject: 'Missing Item from Order #JC45692',
      category: 'Orders & Shipping',
      priority: 'High',
      status: 'Open',
      lastUpdate: '2 hours ago',
    },
    {
      id: 'TK-2024-002',
      subject: 'Washing Instructions',
      category: 'Product Care',
      priority: 'Normal',
      status: 'Closed',
      lastUpdate: '3 days ago',
    },
    {
      id: 'TK-2024-003',
      subject: 'Return Request',
      category: 'Returns',
      priority: 'Normal',
      status: 'In Progress',
      lastUpdate: '1 day ago',
    }
  ]);

  // Calculate ticket metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Closed').length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Sophie!</h1>
        <p className="mt-1 text-gray-600">Here's an overview of your support activities.</p>
      </div>

      {/* Ticket Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-md">
              <FaTicketAlt className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{totalTickets}</div>
          <div className="text-sm text-gray-500">Total Tickets</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-md">
              <FaClock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{openTickets}</div>
          <div className="text-sm text-gray-500">Open Tickets</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-md">
              <FaCheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{resolvedTickets}</div>
          <div className="text-sm text-gray-500">Resolved Tickets</div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
          <Link 
            to="/customer/create-ticket" 
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium"
          >
            Create New Ticket
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <button className="bg-gray-200 px-4 py-2 rounded-lg text-sm">
                All Status
              </button>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-medium ${
                      ticket.status === 'Open' ? 'text-green-500' : 
                      ticket.status === 'In Progress' ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-medium ${
                      ticket.priority === 'High' ? 'text-red-500' : 
                      'text-yellow-500'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link to={`/customer/ticket/${ticket.id}`} className="text-pink-500 hover:text-pink-700">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomerHome; 