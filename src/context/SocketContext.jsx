import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// Get the socket URL from environment variables
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Event handlers stored in a ref for always-up-to-date access
  const eventHandlersRef = useRef(new Map());

  // Subscribe/unsubscribe functions
  const subscribeToEvent = (eventName, handler) => {
    console.log(`[Socket] Subscribing to ${eventName} with handler:`, handler.name || 'anonymous');
    if (!eventHandlersRef.current.has(eventName)) {
      eventHandlersRef.current.set(eventName, new Set());
    }
    eventHandlersRef.current.get(eventName).add(handler);
    console.log(`[Socket] Current handlers for ${eventName}:`, eventHandlersRef.current.get(eventName).size);
  };

  const unsubscribeFromEvent = (eventName, handler) => {
    console.log(`[Socket] Unsubscribing from ${eventName} with handler:`, handler.name || 'anonymous');
    if (eventHandlersRef.current.has(eventName)) {
      eventHandlersRef.current.get(eventName).delete(handler);
      console.log(`[Socket] Remaining handlers for ${eventName}:`, eventHandlersRef.current.get(eventName).size);
    }
  };

  // Socket setup
  useEffect(() => {
    if (!user?.id) {
      console.log('[Socket] No user ID available, skipping socket connection');
      return;
    }

    console.log('[Socket] Connecting to:', SOCKET_URL);
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });

    // Set up connection event handlers
    socketInstance.on('connect', () => {
      console.log('[Socket] Connected, authenticating user:', user.id);
      setIsConnected(true);
      socketInstance.emit('authenticate', user.id);
    });

    socketInstance.on('authenticated', (data) => {
      console.log('[Socket] Authentication successful, role:', data.role);
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
      setSocket(null);
      
      // Only attempt to reconnect if it wasn't a client-side disconnect
      if (reason !== 'io client disconnect') {
        setTimeout(() => {
          console.log('[Socket] Attempting to reconnect...');
          socketInstance.connect();
        }, 1000);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setIsConnected(false);
    });

    // Cleanup function
    return () => {
      console.log('[Socket] Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user?.id]); // Only depend on user.id

  // Handle event subscriptions
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Register all event handlers
    eventHandlersRef.current.forEach((handlers, eventName) => {
      console.log(`[Socket] Subscribing to ${eventName} with handler:`, handlers.size);
      handlers.forEach((handler) => {
        socket.on(eventName, handler);
        console.log(`[Socket] Current handlers for ${eventName}:`, socket.listeners(eventName).length);
      });
    });

    // Cleanup function
    return () => {
      if (!socket) return;
      
      eventHandlersRef.current.forEach((handlers, eventName) => {
        console.log(`[Socket] Unsubscribing from ${eventName} with handler:`, handlers.size);
        handlers.forEach((handler) => {
          socket.off(eventName, handler);
          console.log(`[Socket] Remaining handlers for ${eventName}:`, socket.listeners(eventName).length);
        });
      });
    };
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, subscribeToEvent, unsubscribeFromEvent }}>
      {children}
    </SocketContext.Provider>
  );
}; 