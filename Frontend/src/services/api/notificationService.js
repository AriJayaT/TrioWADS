import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cache for notifications
let notificationsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token ? `Bearer ${token}` : '';
};

// Get notifications with caching
export const getNotifications = async (bypassCache = false) => {
  try {
    const currentTime = Date.now();
    
    // Return cached data if it's still valid and bypass is not requested
    if (!bypassCache && notificationsCache && (currentTime - lastFetchTime) < CACHE_DURATION) {
      return notificationsCache;
    }

    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken()
      },
      withCredentials: true,
    });

    // Update cache
    notificationsCache = response.data;
    lastFetchTime = currentTime;

    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // Return cached data if available and not bypassing cache
    if (!bypassCache && notificationsCache) {
      return notificationsCache;
    }
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken()
        },
        withCredentials: true,
      }
    );

    // Update cache if it exists
    if (notificationsCache) {
      notificationsCache = notificationsCache.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      );
    }

    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Create notification
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/notifications`,
      notificationData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken()
        },
        withCredentials: true,
      }
    );

    // Update cache if it exists
    if (notificationsCache) {
      notificationsCache = [response.data, ...notificationsCache];
    }

    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken()
      },
      withCredentials: true,
    });

    // Update cache if it exists
    if (notificationsCache) {
      notificationsCache = notificationsCache.filter(
        notification => notification._id !== notificationId
      );
    }

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Clear notification cache
export const clearNotificationCache = () => {
  notificationsCache = null;
  lastFetchTime = 0;
};

export const markAllAsRead = async () => {
  try {
    const res = await axios.put(
      `${API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthToken()
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}; 