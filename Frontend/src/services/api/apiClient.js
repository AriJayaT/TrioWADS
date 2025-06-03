import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://e2425-wads-l4acg3-server.csbihub.id/api';

// Create a base axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout to 30 seconds
});

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found in local storage');
  }
  return token;
};

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config; // Continue with request even if interceptor fails
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error?.response?.status || 'No status', error?.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear all auth-related data
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 