import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useTicketUpdates = (onNewTicket, onTicketUpdate) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[useTicketUpdates] No socket connection available or not connected');
      return;
    }

    console.log('[useTicketUpdates] Setting up ticket update handlers');

    // Direct event handlers without useCallback
    const handleNewTicket = (ticket) => {
      console.log('[useTicketUpdates] New ticket received:', ticket);
      try {
        onNewTicket(ticket);
      } catch (error) {
        console.error('[useTicketUpdates] Error handling new ticket:', error);
      }
    };

    const handleTicketUpdate = (ticket) => {
      console.log('[useTicketUpdates] Ticket update received:', ticket);
      try {
        onTicketUpdate(ticket);
      } catch (error) {
        console.error('[useTicketUpdates] Error handling ticket update:', error);
      }
    };

    // Remove any existing listeners
    socket.off('new_ticket');
    socket.off('ticket_updated');

    // Add new listeners
    socket.on('new_ticket', handleNewTicket);
    socket.on('ticket_updated', handleTicketUpdate);

    console.log('[useTicketUpdates] Ticket update handlers set up successfully');

    // Cleanup
    return () => {
      console.log('[useTicketUpdates] Cleaning up ticket update handlers');
      socket.off('new_ticket', handleNewTicket);
      socket.off('ticket_updated', handleTicketUpdate);
    };
  }, [socket, isConnected, onNewTicket, onTicketUpdate]);
}; 