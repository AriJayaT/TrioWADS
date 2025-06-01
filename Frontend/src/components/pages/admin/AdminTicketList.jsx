import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../../layout/DashboardLayout';
import ticketService from '../../../services/api/ticketService';
import { useTicketUpdates } from '../../hooks/useTicketUpdates';

const AdminTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTickets();
      setTickets(response.tickets || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleNewTicket = useCallback((ticket) => {
    console.log('New ticket received:', ticket);
    setTickets(prev => {
      // Check if ticket already exists
      if (prev.some(t => t._id === ticket._id)) return prev;
      // Add new ticket at the beginning
      return [ticket, ...prev];
    });
  }, []);

  const handleTicketUpdate = useCallback((updatedTicket) => {
    console.log('Ticket update received:', updatedTicket);
    setTickets(prev => {
      const index = prev.findIndex(t => t._id === updatedTicket._id);
      if (index === -1) return prev;
      const newTickets = [...prev];
      newTickets[index] = updatedTicket;
      return newTickets;
    });
  }, []);

  // Set up real-time ticket updates
  useTicketUpdates(handleNewTicket, handleTicketUpdate);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <DashboardLayout title="Tickets">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">All Tickets</h2>
          <button
            onClick={fetchTickets}
            className="px-4 py-2 text-sm text-pink-600 hover:text-pink-700"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.ticketNumber || ticket._id || 'Unknown'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.user?.name || 'Unknown'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.subject}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ticket.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${ticket.status === 'open' ? 'bg-green-100 text-green-800' : 
                        ticket.status === 'closed' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTicketList; 