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

  useEffect(() => {
    if (!user?._id) {
      console.log('[Socket] No user ID, not connecting');
      // Clear socket state when no user
      setSocket(null);
      setIsConnected(false);
      return;
    }

    console.log('[Socket] Creating socket connection to:', SOCKET_URL);
    
    // Create socket connection
    const socketInstance = io(SOCKET_URL);
    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected with ID:', socketInstance.id);
      // Don't set isConnected true yet - wait for authentication
      
      // Authenticate user
      console.log('[Socket] Authenticating user:', user._id);
      socketInstance.emit('authenticate', user._id);
    });

    socketInstance.on('authenticated', (data) => {
      console.log('[Socket] Authentication successful, role:', data.role);
      // Only now set both socket and isConnected
      setSocket(socketInstance);
      setIsConnected(true);
    });

    socketInstance.on('unauthorized', (data) => {
      console.error('[Socket] Authentication failed:', data.message);
      setSocket(null);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
      setSocket(null);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setIsConnected(false);
      setSocket(null);
    });

    return () => {
      console.log('[Socket] Cleaning up connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected
    }}>
      {children}
    </SocketContext.Provider>
  );
}; 