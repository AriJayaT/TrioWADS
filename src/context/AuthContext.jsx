import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/api/authService';

// Create an authentication context
const AuthContext = createContext();

// Hook to use the authentication context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth context');
        // Check if user is stored in localStorage
        if (authService.isLoggedIn()) {
          // Get user from localStorage first for immediate UI update
          const storedUser = authService.getStoredUser();
          
          if (storedUser) {
            // Ensure user has both _id and id fields for compatibility
            if (storedUser._id && !storedUser.id) {
              storedUser.id = storedUser._id;
            } else if (storedUser.id && !storedUser._id) {
              storedUser._id = storedUser.id;
            }
            
            console.log('Stored user from localStorage:', storedUser);
            setUser(storedUser);
            setIsAuthenticated(true);
          }
          
          try {
            // Then validate with the server
            const serverUser = await authService.getCurrentUser();
            console.log('User from server:', serverUser);
            
            // Ensure user has both _id and id fields for compatibility
            if (serverUser._id && !serverUser.id) {
              serverUser.id = serverUser._id;
            } else if (serverUser.id && !serverUser._id) {
              serverUser._id = serverUser.id;
            }
            
            setUser(serverUser);
            setIsAuthenticated(true);
            
            // Update localStorage with the latest user data
            localStorage.setItem('user', JSON.stringify(serverUser));
          } catch (err) {
            console.error('Error validating stored auth token:', err);
            // If token validation fails, log the user out
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('No stored auth token found');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login({ email, password });
      
      if (result.user) {
        // Ensure user has both _id and id fields for compatibility
        if (result.user._id && !result.user.id) {
          result.user.id = result.user._id;
        } else if (result.user.id && !result.user._id) {
          result.user._id = result.user.id;
        }
      }
      
      setUser(result.user);
      setIsAuthenticated(true);
      return result.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      setIsAuthenticated(true);
      return result.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user data in context and localStorage
  const updateUserData = (updatedUserData) => {
    const currentUser = { ...user };
    const updatedUser = { ...currentUser, ...updatedUserData };
    
    // Update in context
    setUser(updatedUser);
    
    // Update in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  };

  // Value object with auth state and functions
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 