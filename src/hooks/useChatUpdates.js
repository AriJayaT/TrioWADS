import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Listen for real-time chat updates (new messages, typing status).
 * @param {function} onNewMessage - Called with new message object.
 * @param {function} onTypingStatus - Called with typing status object.
 */
export const useChatUpdates = (onNewMessage, onTypingStatus) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[useChatUpdates] Socket not available or not connected');
      return;
    }

    console.log('[useChatUpdates] Setting up chat update handlers');

    const handleNewMessage = (message) => {
      console.log('[useChatUpdates] Received new message:', message);
      try {
        onNewMessage(message);
      } catch (error) {
        console.error('[useChatUpdates] Error handling new message:', error);
      }
    };

    const handleTypingStatus = (status) => {
      console.log('[useChatUpdates] Received typing status:', status);
      try {
        onTypingStatus(status);
      } catch (error) {
        console.error('[useChatUpdates] Error handling typing status:', error);
      }
    };

    // Remove any existing listeners to prevent duplicates
    socket.off('new_message');
    socket.off('typing_status');

    // Add new listeners
    socket.on('new_message', handleNewMessage);
    socket.on('typing_status', handleTypingStatus);

    console.log('[useChatUpdates] Chat update handlers set up successfully');

    return () => {
      console.log('[useChatUpdates] Cleaning up chat update handlers');
      socket.off('new_message', handleNewMessage);
      socket.off('typing_status', handleTypingStatus);
    };
  }, [socket, isConnected, onNewMessage, onTypingStatus]);
}; 