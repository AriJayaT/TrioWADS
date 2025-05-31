import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../../services/api/ticketService';
import { useTicketUpdates } from '../../hooks/useTicketUpdates';
import { useAuth } from '../../context/AuthContext';

const AdminTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTickets();
      setTickets(response.tickets || []);
    } catch (err) {
      setError('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleNewTicket = useCallback((ticket) => {
    setTickets(prev => {
      if (prev.some(t => t._id === ticket._id)) return prev;
      return [ticket, ...prev];
    });
  }, []);

  const handleTicketUpdate = useCallback((updatedTicket) => {
    setTickets(prev => {
      const index = prev.findIndex(t => t._id === updatedTicket._id);
      if (index === -1) return prev;
      const newTickets = [...prev];
      newTickets[index] = updatedTicket;
      return newTickets;
    });
  }, []);

  useTicketUpdates(handleNewTicket, handleTicketUpdate);

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">All Tickets</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2">Ticket ID</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Subject</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Priority</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket._id}>
              <td className="px-4 py-2">{ticket.ticketNumber || ticket._id || 'Unknown'}</td>
              <td className="px-4 py-2">{ticket.user?.name || 'Unknown'}</td>
              <td className="px-4 py-2">{ticket.subject}</td>
              <td className="px-4 py-2">{ticket.category}</td>
              <td className="px-4 py-2">{ticket.status}</td>
              <td className="px-4 py-2">{ticket.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTicketList; 