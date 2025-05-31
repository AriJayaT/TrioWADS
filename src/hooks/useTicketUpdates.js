import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useTicketUpdates = (onNewTicket, onTicketUpdate) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for new tickets
    socket.on('new_ticket', (ticket) => {
      console.log('[Socket] Received new_ticket:', ticket);
      onNewTicket(ticket);
    });

    // Listen for ticket updates
    socket.on('ticket_updated', (ticket) => {
      console.log('[Socket] Received ticket_updated:', ticket);
      onTicketUpdate(ticket);
    });

    // Cleanup listeners
    return () => {
      socket.off('new_ticket');
      socket.off('ticket_updated');
    };
  }, [socket, onNewTicket, onTicketUpdate]);
}; 