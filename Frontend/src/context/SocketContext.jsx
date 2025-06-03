import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// Get the socket URL from environment variables
const SOCKET_URL = 'https://e2425-wads-l4acg3-server.csbihub.id';

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) {
      console.log('[Socket] No user ID, not connecting');
      // Clear socket state when no user
      setSocket(null);
      setIsConnected(false);
      setIsAuthenticated(false);
      return;
    }

    console.log('[Socket] Creating socket connection to:', SOCKET_URL);
    
    // Create socket connection
    const socketInstance = io(SOCKET_URL);
    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected with ID:', socketInstance.id);
      setIsConnected(true);
      
      // Authenticate user
      console.log('[Socket] Authenticating user:', user._id);
      socketInstance.emit('authenticate', user._id);
    });

    socketInstance.on('authenticated', (data) => {
      console.log('[Socket] Authentication successful, role:', data.role);
      setIsAuthenticated(true);
      setSocket(socketInstance);
    });

    socketInstance.on('unauthorized', (data) => {
      console.error('[Socket] Authentication failed:', data.message);
      setSocket(null);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
      setIsAuthenticated(false);
      setSocket(null);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setIsConnected(false);
      setIsAuthenticated(false);
      setSocket(null);
    });

    return () => {
      console.log('[Socket] Cleaning up connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      setIsAuthenticated(false);
    };
  }, [user?._id]);

  // Only provide socket if both connected and authenticated
  const socketValue = isConnected && isAuthenticated ? socket : null;

  return (
    <SocketContext.Provider value={{ 
      socket: socketValue,
      isConnected: isConnected && isAuthenticated
    }}>
      {children}
    </SocketContext.Provider>
  );
}; 