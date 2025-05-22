import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import ticketService from '../../../services/api/ticketService';
import { useAuth } from '../../../context/AuthContext';

const CustomerHome = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getTickets();
        setTickets(response.tickets || []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Calculate ticket metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'closed').length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // Difference in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting-for-customer':
        return 'bg-blue-100 text-blue-800';
      case 'waiting-for-agent':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    return 'bg-pink-100 text-pink-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Customer'}!</h1>
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

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <FaTicketAlt className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No tickets yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any support tickets. Need help? Create your first ticket.
              </p>
              <div className="mt-6">
                <Link
                  to="/customer/create-ticket"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Create New Ticket
                </Link>
              </div>
            </div>
          ) : (
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
                {tickets.slice(0, 3).map((ticket) => (
                  <tr key={ticket._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'waiting-for-customer' ? 'Reply Requested' : 
                         ticket.status === 'waiting-for-agent' ? 'Waiting for Agent' :
                         ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-500 font-medium">
                      <Link to={`/customer/ticket/${ticket._id || ticket.id}`}>View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerHome; 