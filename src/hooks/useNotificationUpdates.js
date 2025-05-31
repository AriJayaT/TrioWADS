import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useNotificationUpdates = (onNewNotification, onNotificationRead) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      console.log('[useNotificationUpdates] Socket not available');
      return;
    }

    console.log('[useNotificationUpdates] Setting up socket listeners');

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      console.log('[Socket] Received new_notification:', notification);
      onNewNotification(notification);
    });

    // Listen for notification read status updates
    socket.on('notification_read', (notification) => {
      console.log('[Socket] Received notification_read:', notification);
      onNotificationRead(notification);
    });

    // Cleanup listeners
    return () => {
      socket.off('new_notification');
      socket.off('notification_read');
    };
  }, [socket, onNewNotification, onNotificationRead]);
}; 