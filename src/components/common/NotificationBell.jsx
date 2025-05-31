import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBell, FaSpinner } from 'react-icons/fa';
import { getNotifications, markNotificationAsRead } from '../../services/api/notificationService';
import { useSocket } from '../../context/SocketContext';
import { useNotificationUpdates } from '../../hooks/useNotificationUpdates';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected, subscribeToEvent, unsubscribeFromEvent } = useSocket();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const handlersRef = useRef({});

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
    try {
      setLoading(true);
      const response = await getNotifications();
      console.log('[NotificationBell] Fetched notifications:', response);
      setNotifications(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('[NotificationBell] Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add socket event handlers
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[NotificationBell] Socket not connected, skipping event handlers');
      return;
    }

    console.log('[NotificationBell] Setting up socket event handlers');

    // Clean up any existing handlers
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      unsubscribeFromEvent(event, handler);
    });
    handlersRef.current = {};

    const handleNewNotification = (notification) => {
      console.log('[NotificationBell] New notification received:', notification);
      setNotifications(prev => {
        const exists = prev.some(n => n._id === notification._id);
        if (exists) {
          return prev.map(n => n._id === notification._id ? notification : n);
        }
        return [notification, ...prev];
      });
    };

    const handleNotificationRead = (notificationId) => {
      console.log('[NotificationBell] Notification read:', notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    };

    const handleNotificationUpdated = (notification) => {
      console.log('[NotificationBell] Notification updated:', notification);
      setNotifications(prev => 
        prev.map(n => n._id === notification._id ? notification : n)
      );
    };

    const handleTicketAssigned = (ticket) => {
      console.log('[NotificationBell] Ticket assigned:', ticket);
      fetchNotifications();
    };

    const handleNewReply = (reply) => {
      console.log('[NotificationBell] New reply:', reply);
      fetchNotifications();
    };

    const handleTicketUpdated = (ticket) => {
      console.log('[NotificationBell] Ticket updated:', ticket);
      fetchNotifications();
    };

    const handleTicketEscalated = (ticket) => {
      console.log('[NotificationBell] Ticket escalated:', ticket);
      fetchNotifications();
    };

    const handleNewTicket = (ticket) => {
      console.log('[NotificationBell] New ticket:', ticket);
      fetchNotifications();
    };

    // Store handlers in ref for cleanup
    handlersRef.current = {
      new_notification: handleNewNotification,
      notification_read: handleNotificationRead,
      notification_updated: handleNotificationUpdated,
      ticket_assigned: handleTicketAssigned,
      new_reply: handleNewReply,
      ticket_updated: handleTicketUpdated,
      ticket_escalated: handleTicketEscalated,
      new_ticket: handleNewTicket
    };

    // Subscribe to events
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      subscribeToEvent(event, handler);
    });

    // Initial data fetch
    fetchNotifications();

    // Cleanup subscriptions
    return () => {
      console.log('[NotificationBell] Cleaning up socket event subscriptions');
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        unsubscribeFromEvent(event, handler);
      });
      handlersRef.current = {};
    };
  }, [socket, isConnected, subscribeToEvent, unsubscribeFromEvent, fetchNotifications]);

  // Debug logging for socket connection
  useEffect(() => {
    console.log('[NotificationBell] Socket connection status:', isConnected);
    if (isConnected) {
      fetchNotifications();
    }
  }, [isConnected, fetchNotifications]);

  // Debug logging for notifications updates
  useEffect(() => {
    console.log('[NotificationBell] Notifications updated:', notifications);
  }, [notifications]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('[NotificationBell] Error marking notification as read:', error);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handler for new notifications (tickets, chat, etc.)
  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    // Optionally, show a toast or badge
    console.log('[NotificationBell] New notification received:', notification);
  };

  // Listen for both ticket and chat notifications
  useNotificationUpdates(handleNewNotification);

  useEffect(() => {
    // Listen for chat message notifications as well
    if (!socket || !isConnected) return;
    const handleChatMessageNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      console.log('[NotificationBell] New chat message notification:', notification);
    };
    socket.on('new_message_notification', handleChatMessageNotification);
    return () => {
      socket.off('new_message_notification', handleChatMessageNotification);
    };
  }, [socket, isConnected]);

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