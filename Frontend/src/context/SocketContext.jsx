import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
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
  const activeListenersRef = useRef(new Set());

  // Subscribe/unsubscribe functions with improved conflict handling
  const subscribeToEvent = useCallback((eventName, handler, componentName = 'unknown') => {
    console.log(`[Socket] ${componentName} subscribing to ${eventName}`, {
      isConnected,
      hasSocket: !!socket,
      userId: user?.id
    });
    
    if (!eventHandlersRef.current.has(eventName)) {
      eventHandlersRef.current.set(eventName, new Map());
    }
    
    // Store handler with component identifier
    const handlerMap = eventHandlersRef.current.get(eventName);
    if (!handlerMap.has(componentName)) {
      handlerMap.set(componentName, new Set());
    }
    handlerMap.get(componentName).add(handler);
    
    // Register the handler if socket is available
    if (socket && isConnected) {
      const wrappedHandler = (...args) => {
        try {
          console.log(`[Socket] Received ${eventName} event:`, args);
          handler(...args);
        } catch (error) {
          console.error(`[Socket] Error in ${componentName} handler for ${eventName}:`, error);
        }
      };
      
      socket.on(eventName, wrappedHandler);
      activeListenersRef.current.add({ eventName, handler: wrappedHandler, componentName });
      console.log(`[Socket] Handler registered for ${eventName} from ${componentName}`);
    } else {
      console.log(`[Socket] Socket not ready for ${eventName}, handler will be registered when connected`);
    }
  }, [socket, isConnected, user?.id]);

  const unsubscribeFromEvent = useCallback((eventName, handler, componentName = 'unknown') => {
    console.log(`[Socket] ${componentName} unsubscribing from ${eventName}`);
    
    if (eventHandlersRef.current.has(eventName)) {
      const handlerMap = eventHandlersRef.current.get(eventName);
      if (handlerMap.has(componentName)) {
        handlerMap.get(componentName).delete(handler);
        
        // Clean up empty sets
        if (handlerMap.get(componentName).size === 0) {
          handlerMap.delete(componentName);
        }
        if (handlerMap.size === 0) {
          eventHandlersRef.current.delete(eventName);
        }
      }
    }
    
    // Remove from socket if available
    if (socket) {
      // Find and remove the corresponding active listener
      const listenersToRemove = Array.from(activeListenersRef.current).filter(
        listener => listener.eventName === eventName && listener.componentName === componentName
      );
      
      listenersToRemove.forEach(listener => {
        socket.off(eventName, listener.handler);
        activeListenersRef.current.delete(listener);
      });
    }
  }, [socket]);

  const unsubscribeAllFromComponent = useCallback((componentName) => {
    console.log(`[Socket] Unsubscribing all events for component: ${componentName}`);
    
    eventHandlersRef.current.forEach((handlerMap, eventName) => {
      if (handlerMap.has(componentName)) {
        handlerMap.delete(componentName);
        
        // Clean up empty event entries
        if (handlerMap.size === 0) {
          eventHandlersRef.current.delete(eventName);
        }
      }
    });
    
    // Remove active listeners for this component
    if (socket) {
      const listenersToRemove = Array.from(activeListenersRef.current).filter(
        listener => listener.componentName === componentName
      );
      
      listenersToRemove.forEach(listener => {
        socket.off(listener.eventName, listener.handler);
        activeListenersRef.current.delete(listener);
      });
    }
  }, [socket]);

  // Socket setup
  useEffect(() => {
    if (!user?.id) {
      console.log('[Socket] No user ID available, skipping socket connection');
      return;
    }

    // If we already have a socket instance and it's connected, just update the user
    if (socketRef.current && socketRef.current.connected) {
      console.log('[Socket] Updating user for existing connection:', user.id);
      socketRef.current.emit('authenticate', user.id);
      return;
    }

    console.log('[Socket] Connecting to:', SOCKET_URL);
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
    });

    socketRef.current = socketInstance;

    // Set up connection event handlers
    socketInstance.on('connect', () => {
      console.log('[Socket] Connected successfully');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Add a small delay before authentication to ensure connection is stable
      setTimeout(() => {
        socketInstance.emit('authenticate', user.id);
      }, 100);
    });

    socketInstance.on('authenticated', (data) => {
      console.log('[Socket] Authentication successful, role:', data.role);
      setSocket(socketInstance);
      
      // Re-register all event handlers after successful authentication
      eventHandlersRef.current.forEach((handlerMap, eventName) => {
        handlerMap.forEach((handlerSet, componentName) => {
          handlerSet.forEach((handler) => {
            const wrappedHandler = (...args) => {
              try {
                handler(...args);
              } catch (error) {
                console.error(`[Socket] Error in ${componentName} handler for ${eventName}:`, error);
              }
            };
            
            socketInstance.on(eventName, wrappedHandler);
            activeListenersRef.current.add({ eventName, handler: wrappedHandler, componentName });
          });
        });
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
      
      // Clear active listeners
      activeListenersRef.current.clear();
      
      // Only attempt to reconnect if it wasn't a client-side disconnect
      if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 5000);
        console.log(`[Socket] Attempting to reconnect in ${delay}ms... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          if (socketInstance && !socketInstance.connected) {
            socketInstance.connect();
          }
        }, delay);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
        setSocket(null);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setIsConnected(false);
      
      // Attempt to reconnect on connection error
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 5000);
        console.log(`[Socket] Connection error, attempting to reconnect in ${delay}ms... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          if (socketInstance && !socketInstance.connected) {
            socketInstance.connect();
          }
        }, delay);
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });

    // Cleanup function
    return () => {
      console.log('[Socket] Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.disconnect();
      }
      activeListenersRef.current.clear();
      eventHandlersRef.current.clear();
    };
  }, [user?.id]); // Only depend on user.id

  // Re-register handlers when socket connects
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('[Socket] Re-registering event handlers after connection');
    
    // Clear any existing active listeners
    activeListenersRef.current.clear();
    
    // Register all stored handlers
    eventHandlersRef.current.forEach((handlerMap, eventName) => {
      handlerMap.forEach((handlerSet, componentName) => {
        handlerSet.forEach((handler) => {
          const wrappedHandler = (...args) => {
            try {
              handler(...args);
            } catch (error) {
              console.error(`[Socket] Error in ${componentName} handler for ${eventName}:`, error);
            }
          };
          
          socket.on(eventName, wrappedHandler);
          activeListenersRef.current.add({ eventName, handler: wrappedHandler, componentName });
        });
      });
    });

    console.log('[Socket] All handlers re-registered');
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      subscribeToEvent, 
      unsubscribeFromEvent,
      unsubscribeAllFromComponent
    }}>
      {children}
    </SocketContext.Provider>
  );
}; 