import apiClient from './apiClient';

export const getNotifications = async () => {
  try {
    const res = await apiClient.get('/notifications');
    return res.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const createNotification = async (notification) => {
  try {
    const res = await apiClient.post('/notifications', notification);
    return res.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await apiClient.put('/notifications/mark-all-read');
    return res.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}; 