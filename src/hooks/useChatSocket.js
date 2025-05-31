import { useEffect } from 'react';
import { io } from 'socket.io-client';

console.log('VITE_WEBSOCKET_URL:', import.meta.env.VITE_WEBSOCKET_URL); // Debug: check env value
const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export function useChatSocket(userId, onNewMessage, onNotification) {
  useEffect(() => {
    if (!userId) return;
    console.log('[useChatSocket] Registering handlers for userId:', userId);
    
    // Connect to socket
    socket.connect();
    socket.emit('authenticate', userId);

    const newMessageHandler = (msg) => {
      console.log('[useChatSocket] Received new_message for userId:', userId, msg);
      onNewMessage(msg);
    };
    const notificationHandler = (notif) => {
      console.log('[useChatSocket] Received notification for userId:', userId, notif);
      onNotification(notif);
    };

    socket.on('connect', () => {
      console.log('[useChatSocket] Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('[useChatSocket] Disconnected from socket server');
    });

    socket.on('new_message', newMessageHandler);
    socket.on('notification', notificationHandler);

    return () => {
      console.log('[useChatSocket] Cleaning up handlers for userId:', userId);
      socket.off('new_message', newMessageHandler);
      socket.off('notification', notificationHandler);
      socket.disconnect();
    };
  }, [userId, onNewMessage, onNotification]);
} 