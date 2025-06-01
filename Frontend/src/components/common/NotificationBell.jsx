import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell, FaSpinner } from 'react-icons/fa';
import { getNotifications, markNotificationAsRead } from '../../services/api/notificationService';
import { useSocket } from '../../context/SocketContext';

const COMPONENT_NAME = 'NotificationBell';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected, subscribeToEvent, unsubscribeFromEvent, unsubscribeAllFromComponent } = useSocket();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const isMountedRef = useRef(true);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchNotifications = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      const response = await getNotifications();
      console.log(`[${COMPONENT_NAME}] Fetched notifications:`, response);
      
      if (isMountedRef.current) {
        setNotifications(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error(`[${COMPONENT_NAME}] Error fetching notifications:`, error);
      if (isMountedRef.current) {
        setNotifications([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Socket event handlers with useCallback to prevent re-registration
  const handleNewNotification = useCallback((notification) => {
    console.log(`[${COMPONENT_NAME}] New notification received:`, notification);
    if (!isMountedRef.current) return;
    
    setNotifications(prev => {
      const exists = prev.some(n => n._id === notification._id);
      if (exists) {
        return prev.map(n => n._id === notification._id ? notification : n);
      }
      return [notification, ...prev];
    });
  }, []);

  const handleNotificationRead = useCallback((notificationId) => {
    console.log(`[${COMPONENT_NAME}] Notification read:`, notificationId);
    if (!isMountedRef.current) return;
    
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const handleNotificationUpdated = useCallback((notification) => {
    console.log(`[${COMPONENT_NAME}] Notification updated:`, notification);
    if (!isMountedRef.current) return;
    
    setNotifications(prev => 
      prev.map(n => n._id === notification._id ? notification : n)
    );
  }, []);

  const handleTicketEvent = useCallback((data) => {
    console.log(`[${COMPONENT_NAME}] Ticket event received:`, data);
    if (!isMountedRef.current) return;
    
    // Refresh notifications for ticket-related events
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up socket event subscriptions
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log(`[${COMPONENT_NAME}] Socket not connected, skipping event handlers`);
      return;
    }

    console.log(`[${COMPONENT_NAME}] Setting up socket event handlers`);

    // Subscribe to events with component identifier
    subscribeToEvent('new_notification', handleNewNotification, COMPONENT_NAME);
    subscribeToEvent('notification_read', handleNotificationRead, COMPONENT_NAME);
    subscribeToEvent('notification_updated', handleNotificationUpdated, COMPONENT_NAME);
    subscribeToEvent('ticket_assigned', handleTicketEvent, COMPONENT_NAME);
    subscribeToEvent('new_reply', handleTicketEvent, COMPONENT_NAME);
    subscribeToEvent('ticket_updated', handleTicketEvent, COMPONENT_NAME);
    subscribeToEvent('ticket_escalated', handleTicketEvent, COMPONENT_NAME);
    subscribeToEvent('new_ticket', handleTicketEvent, COMPONENT_NAME);

    // Initial data fetch
    fetchNotifications();

    // Cleanup function
    return () => {
      console.log(`[${COMPONENT_NAME}] Cleaning up socket event subscriptions`);
      unsubscribeAllFromComponent(COMPONENT_NAME);
    };
  }, [socket, isConnected, subscribeToEvent, unsubscribeAllFromComponent, 
      handleNewNotification, handleNotificationRead, handleNotificationUpdated, 
      handleTicketEvent, fetchNotifications]);

  // Debug logging for socket connection
  useEffect(() => {
    console.log(`[${COMPONENT_NAME}] Socket connection status:`, isConnected);
    if (isConnected) {
      fetchNotifications();
    }
  }, [isConnected, fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error(`[${COMPONENT_NAME}] Error marking notification as read:`, error);
    }
  }, []);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
    // Mark all notifications as read when opening the dropdown
    if (!showDropdown) {
      notifications.forEach(notification => {
        if (!notification.read) {
          handleMarkAsRead(notification._id);
        }
      });
    }
  }, [showDropdown, notifications, handleMarkAsRead]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      unsubscribeAllFromComponent(COMPONENT_NAME);
    };
  }, [unsubscribeAllFromComponent]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-pink-500 focus:outline-none"
        type="button"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-pink-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            {loading ? (
              <div className="flex justify-center p-4">
                <FaSpinner className="animate-spin text-pink-500" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 border-b last:border-b-0 ${
                      !notification.read ? 'bg-pink-50' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 