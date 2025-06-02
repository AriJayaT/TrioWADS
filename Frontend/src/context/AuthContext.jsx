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
          const storedRole = localStorage.getItem('userRole');
          
          if (storedUser) {
            // Ensure user has both _id and id fields for compatibility with socket
            const normalizedUser = {
              ...storedUser,
              _id: storedUser._id || storedUser.id,
              id: storedUser.id || storedUser._id
            };
            
            // Validate that stored role matches user role
            if (storedRole && storedRole !== normalizedUser.role) {
              console.warn('Stored role does not match user role, clearing auth data');
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            
            console.log('Stored user from localStorage:', normalizedUser);
            setUser(normalizedUser);
            setIsAuthenticated(true);
          }
          
          try {
            // Then validate with the server
            const serverUser = await authService.getCurrentUser();
            console.log('User from server:', serverUser);
            
            // Ensure user has both _id and id fields for compatibility with socket
            const normalizedServerUser = {
              ...serverUser,
              _id: serverUser._id || serverUser.id,
              id: serverUser.id || serverUser._id
            };
            
            // Validate that server role matches stored role
            if (storedRole && normalizedServerUser.role !== storedRole) {
              console.warn('Server role does not match stored role, clearing auth data');
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            
            setUser(normalizedServerUser);
            setIsAuthenticated(true);
            
            // Update localStorage with the latest normalized user data
            localStorage.setItem('user', JSON.stringify(normalizedServerUser));
            localStorage.setItem('userRole', normalizedServerUser.role);
          } catch (err) {
            console.error('Error validating stored auth token:', err);
            // If token validation fails (e.g., 401), ensure state is cleared
            authService.logout(); // Clear storage if not already
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('No stored auth token found');
          // Ensure state is clear if no token is found
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        // Ensure state is clear on any initialization error
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (userDataOrEmail, passwordOrToken) => {
    setLoading(true);
    setError(null);
    
    try {
      let user = null;
      let token = null;

      if (typeof userDataOrEmail === 'string' && typeof passwordOrToken === 'string') {
        // Local login with email and password
        console.log('AuthContext login: Attempting local login');
        const result = await authService.login({ email: userDataOrEmail, password: passwordOrToken });
        user = result.user;
        token = result.token;
      } else if (typeof userDataOrEmail === 'object' && typeof passwordOrToken === 'string') {
        // Google login or email verification success with user object and token
        console.log('AuthContext login: Handling Google/Verification success');
        user = userDataOrEmail;
        token = passwordOrToken;
        // authService.loginWithGoogle or verifyEmail should have already stored token/user
        // We just need to update context state here
      } else {
        throw new Error('Invalid arguments provided to login function.');
      }

      if (user && token) {
        // Ensure user has both _id and id fields for compatibility with socket
        const normalizedUser = {
          ...user,
          _id: user._id || user.id,
          id: user.id || user._id
        };

        // Store the user's role in localStorage (ensure it matches the user object's role)
        if (normalizedUser.role) {
             localStorage.setItem('userRole', normalizedUser.role);
        } else {
             // If role is missing in user object, attempt to get it from localStorage
             // This might happen with older stored data, but newer flows should provide it.
             const storedRole = localStorage.getItem('userRole');
             if (storedRole) normalizedUser.role = storedRole;
        }

        // Store the token and user in localStorage if not already done by authService
        // This provides a fallback in case the authService function didn't store them
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        setUser(normalizedUser);
        setIsAuthenticated(true);
        return normalizedUser;
      }
       else { // Should not happen if authService functions work correctly
           throw new Error('Login failed: Missing user or token in result.');
       }
    } catch (err) {
      setError(err.message || 'Login failed');
      // Ensure state is cleared on login failure
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
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