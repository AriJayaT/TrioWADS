import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { getNotifications, markNotificationAsRead } from '../../services/api/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useNotificationUpdates } from '../../hooks/useNotificationUpdates';

const NotificationBell = ({ className = '' }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const notifRef = useRef(null);
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setLoadingNotifs(true);
        const notifs = await getNotifications();
        setNotifications(notifs);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
      } finally {
        setLoadingNotifs(false);
      }
    };
    if (user && user.id) fetchNotifs();
  }, [user]);

  // Set up real-time notification updates
  useNotificationUpdates(
    (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    },
    (updatedNotification) => {
      setNotifications(prev =>
        prev.map(n => n._id === updatedNotification._id ? updatedNotification : n)
      );
    }
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark all as read when dropdown is opened
  const handleNotifDropdown = async () => {
    if (!notifOpen) {
      const unread = notifications.filter(n => !n.read);
      try {
        await Promise.all(unread.map(n => markNotificationAsRead(n._id)));
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    }
    setNotifOpen(!notifOpen);
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className={`relative ${className}`} ref={notifRef}>
      <button
        onClick={handleNotifDropdown}
        className="relative focus:outline-none cursor-pointer hover:text-pink-600 transition-colors"
        data-testid="notification-bell-btn"
      >
        <FaBell className="text-xl text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-xs">
            {unreadCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500">{unreadCount} unread</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loadingNotifs ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`block px-4 py-3 text-sm border-b last:border-b-0 hover:bg-pink-50 transition ${
                    notif.read ? 'text-gray-500' : 'text-gray-800 font-medium bg-pink-50'
                  }`}
                  onClick={() => setNotifOpen(false)}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs rounded px-2 py-0.5 mr-2 ${
                      notif.type === 'ticket_assigned' ? 'bg-blue-100 text-blue-600' :
                      notif.type === 'ticket_updated' ? 'bg-yellow-100 text-yellow-600' :
                      notif.type === 'ticket_resolved' ? 'bg-green-100 text-green-600' :
                      'bg-pink-100 text-pink-600'
                    }`}>
                      {notif.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(notif.timestamp)}</span>
                  </div>
                  <p className="mt-1">{notif.message}</p>
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