import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('No authentication token found in local storage');
  }
  return token;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get the current user profile
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.user || response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error(`Server responded with status ${error.response.status}: ${error.response.statusText}`);
      
      if (error.response.status === 401) {
        // Token expired or invalid
        console.warn('Authentication failed, token may be expired');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    }
    
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/auth/profile', profileData);
    
    // Determine where the user data is in the response
    const userData = response.data.user || response.data;
    
    // Update local storage
    if (userData) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return userData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change user password
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/auth/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}; 