import apiClient from './apiClient';

export const getNotifications = async () => {
  const res = await apiClient.get('/notifications');
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  const res = await apiClient.put(`/notifications/${id}/read`);
  return res.data;
};

export const createNotification = async (notification) => {
  const res = await apiClient.post('/notifications', notification);
  return res.data;
}; 