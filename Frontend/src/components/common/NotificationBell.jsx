import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import { getNotifications, markNotificationAsRead, markAllAsRead } from '../../services/api/notificationService';
import { useAuth } from '../../context/AuthContext';

const COMPONENT_NAME = 'NotificationBell';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { socket, isConnected, subscribeToEvent, unsubscribeFromEvent } = useSocket();
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const handlersRef = useRef({});
  const isMountedRef = useRef(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!localStorage.getItem('authToken');

  // Fetch notifications with error handling
  const fetchNotifications = useCallback(async (bypassCache = false) => {
    if (!isAuthenticated) {
      console.log(`[${COMPONENT_NAME}] User not authenticated, skipping notification fetch`);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getNotifications(bypassCache);
      console.log(`[${COMPONENT_NAME}] Fetched notifications:`, data);
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error(`[${COMPONENT_NAME}] Invalid notification data received:`, data);
        setNotifications([]);
      }
    } catch (error) {
      console.error(`[${COMPONENT_NAME}] Error fetching notifications:`, error);
      if (error.response?.status === 401) {
        console.log(`[${COMPONENT_NAME}] Authentication error, clearing notifications`);
        setNotifications([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket event setup
  useEffect(() => {
    if (!socket || !isConnected || !user?.role) {
      console.log(`[${COMPONENT_NAME}] Missing required data:`, { 
        hasSocket: !!socket, 
        isConnected, 
        userRole: user?.role,
        userId: user?.id
      });
      return;
    }

    console.log(`[${COMPONENT_NAME}] Setting up socket event handlers with user:`, {
      role: user.role,
      id: user.id
    });

    // Clean up any existing handlers
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      unsubscribeFromEvent(event, handler, COMPONENT_NAME);
    });
    handlersRef.current = {};

    const handleNewNotification = (notification) => {
      console.log(`[${COMPONENT_NAME}] New notification received:`, {
        notification,
        userRole: user.role,
        notificationRole: notification.role
      });
      
      if (!isMountedRef.current) return;
      
      if (notification.role === user.role) {
        // Fetch fresh notifications, bypassing cache
        fetchNotifications(true);
      } else {
        console.log(`[${COMPONENT_NAME}] Notification role mismatch:`, {
          notificationRole: notification.role,
          userRole: user.role
        });
      }
    };

    const handleTicketAssigned = (ticket) => {
      console.log(`[${COMPONENT_NAME}] Ticket assigned:`, ticket);
      // Fetch fresh notifications, bypassing cache
      fetchNotifications(true);
    };

    const handleNotificationsMarkedRead = () => {
      console.log(`[${COMPONENT_NAME}] All notifications marked as read`);
      if (!isMountedRef.current) return;
      
      setNotifications(prev => {
        const updatedNotifications = prev.map(notification => ({ ...notification, read: true }));
        console.log(`[${COMPONENT_NAME}] Updated notifications after marking all as read:`, updatedNotifications);
        return updatedNotifications;
      });
    };

    const handleNotificationUpdate = (updatedNotification) => {
      console.log(`[${COMPONENT_NAME}] Notification updated:`, updatedNotification);
      if (!isMountedRef.current) return;
      
      if (updatedNotification.role === user.role) {
        setNotifications(prev => {
          const updatedNotifications = prev.map(notification =>
            notification._id === updatedNotification._id
              ? updatedNotification
              : notification
          );
          console.log(`[${COMPONENT_NAME}] Updated notifications after single update:`, updatedNotifications);
          return updatedNotifications;
        });
      }
    };

    // Store handlers in ref for cleanup
    handlersRef.current = {
      new_notification: handleNewNotification,
      notifications_marked_read: handleNotificationsMarkedRead,
      notification_updated: handleNotificationUpdate,
      ticket_assigned: handleTicketAssigned
    };

    // Subscribe to events with error handling
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      try {
        subscribeToEvent(event, handler, COMPONENT_NAME);
        console.log(`[${COMPONENT_NAME}] Successfully subscribed to ${event}`);
      } catch (error) {
        console.error(`[${COMPONENT_NAME}] Error subscribing to ${event}:`, error);
      }
    });

    // Initial fetch with retry logic and periodic refresh
    const fetchWithRetry = async (retries = 3) => {
      try {
        await fetchNotifications();
      } catch (error) {
        console.error(`[${COMPONENT_NAME}] Error fetching notifications (attempt ${4 - retries}/3):`, error);
        if (retries > 0) {
          setTimeout(() => fetchWithRetry(retries - 1), 1000);
        }
      }
    };

    fetchWithRetry();

    // Set up periodic refresh of notifications
    const refreshInterval = setInterval(() => {
      if (isMountedRef.current) {
        console.log(`[${COMPONENT_NAME}] Performing periodic notification refresh`);
        fetchNotifications();
      }
    }, 30000); // Refresh every 30 seconds

    // Cleanup subscriptions and interval
    return () => {
      console.log(`[${COMPONENT_NAME}] Cleaning up socket event subscriptions and intervals`);
      clearInterval(refreshInterval);
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        try {
          unsubscribeFromEvent(event, handler, COMPONENT_NAME);
          console.log(`[${COMPONENT_NAME}] Successfully unsubscribed from ${event}`);
        } catch (error) {
          console.error(`[${COMPONENT_NAME}] Error unsubscribing from ${event}:`, error);
        }
      });
      handlersRef.current = {};
    };
  }, [socket, isConnected, user?.role, fetchNotifications, subscribeToEvent, unsubscribeFromEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle dropdown toggle
  const handleToggle = async () => {
    if (!isAuthenticated) {
      console.log(`[${COMPONENT_NAME}] User not authenticated, cannot toggle notifications`);
      return;
    }

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Mark all notifications as read when opening the dropdown
    if (newIsOpen && notifications.some(n => !n.read)) {
      try {
        const response = await markAllAsRead();
        console.log(`[${COMPONENT_NAME}] Mark all as read response:`, response);
        
        // Update local state immediately for better UX
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
      } catch (error) {
        console.error(`[${COMPONENT_NAME}] Error marking notifications as read:`, error);
      }
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        aria-label="Notifications"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 