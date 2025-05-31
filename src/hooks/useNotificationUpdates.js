import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Listen for real-time notification updates.
 * @param {function} onNewNotification - Called with new notification object.
 */
export const useNotificationUpdates = (onNewNotification) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_notification', onNewNotification);

    return () => {
      socket.off('new_notification', onNewNotification);
    };
  }, [socket, isConnected, onNewNotification]);
}; 