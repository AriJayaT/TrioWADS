import apiClient from './apiClient';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://e2425-wads-l4acg3-server.csbihub.id/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '28730692613-uvuvd2pfpf1iii5jmvkkn25cej6fa160.apps.googleusercontent.com';

/**
 * Authentication service for user login, registration, and profile management
 */
const authService = {
  /**
   * Loads and initializes the Google API client
   * @returns {Promise<void>}
   */
  loadGoogleApiClient: () => {
    return new Promise((resolve, reject) => {
      // Check if gapi is already loaded
      if (window.gapi && window.gapi.auth2) {
        resolve();
        return;
      }

      // Load the Google API client
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'profile email',
          }).then(() => {
            console.log('Google API client initialized');
            resolve();
          }).catch((error) => {
            console.error('Error initializing Google API client:', error);
            reject(error);
          });
        });
      };
      script.onerror = (error) => {
        console.error('Error loading Google API script:', error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Login a user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - User data and token
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Don't store anything until we validate the role
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and user in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      // Clear any partial data if login fails
      authService.logout();
      throw error.response?.data?.error || 'Login failed';
    }
  },
  
  /**
   * Login with Google
   * @param {Object} credentialResponse - The credential response from Google Login
   * @param {string} role - The intended role for the user
   * @returns {Promise<Object>} - User data and token
   */
  loginWithGoogle: async (credentialResponse, role) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        throw new Error('No ID token received from Google.');
      }

      // Send the ID token and role to your backend for verification and authentication
      const response = await apiClient.post('/auth/google', { idToken, role });

      // Store token and user in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // We don't get role directly from Google here, will need to fetch user or rely on backend response structure
        // Assuming backend response includes user role:
         if (response.data.user && response.data.user.role) {
             localStorage.setItem('userRole', response.data.user.role);
         }
      }

      return response.data;
    } catch (error) {
      console.error('Google login failed:', error);
      // Clear any partial data if login fails
      authService.logout();
      throw error.response?.data?.error || 'Google login failed';
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} - Registered user data and token
   */
  register: async (userData) => {
    try {
      // Clear any existing auth data before registration
      authService.logout();
      
      const response = await apiClient.post('/auth/register', userData);
      
      // Store token and user in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', userData.role);
      }
      
      return response.data;
    } catch (error) {
      // Clear any partial data if registration fails
      authService.logout();
      throw error.response?.data?.error || 'Registration failed';
    }
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },
  
  /**
   * Get the currently logged-in user's profile
   * @returns {Promise<Object>} - User profile data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user || response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch user profile';
    }
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data.user;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile';
    }
  },
  
  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} - Success message
   */
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/auth/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to change password';
    }
  },
  
  /**
   * Check if a user is logged in
   * @returns {boolean} - True if user is logged in
   */
  isLoggedIn: () => {
    try {
      return !!localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },
  
  /**
   * Get the logged-in user from localStorage
   * @returns {Object|null} - User object or null if not logged in
   */
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      // If there's an error parsing the user data, clear it
      try {
        localStorage.removeItem('user');
      } catch (e) {
        console.error('Failed to remove corrupted user data:', e);
      }
      return null;
    }
  },
  
  /**
   * Send verification code to user's email
   * @param {string} email - User's email address
   * @returns {Promise<Object>} - Success message
   */
  sendVerificationCode: async (email) => {
    try {
      const response = await apiClient.post('/auth/send-verification', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to send verification code';
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await apiClient.get(`/auth/verify-email/${token}`);
      // Assuming the backend response includes user data and token after verification
      if (response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Also update the role if it's included in the response
        if (response.data.user.role) {
          localStorage.setItem('userRole', response.data.user.role);
        }
      }
      return response.data;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error.response?.data?.error || 'Email verification failed';
    }
  },

  /**
   * Request a password reset email
   * @param {string} email - User's email address
   * @returns {Promise<Object>} - Success message
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error.response?.data?.error || 'Forgot password request failed';
    }
  },

  /**
   * Reset user password using token
   * @param {string} token - The reset password token
   * @param {string} password - The new password
   * @returns {Promise<Object>} - Success message and potentially new token
   */
  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.put(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error.response?.data?.error || 'Password reset failed';
    }
  }
};

export default authService; 