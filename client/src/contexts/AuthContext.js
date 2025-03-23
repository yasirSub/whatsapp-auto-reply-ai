import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const { enqueueSnackbar } = useSnackbar();

  // Set axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auth_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/me');
        setCurrentUser(response.data.data);
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setToken(response.data.data.token);
      setCurrentUser(response.data.data.user);
      enqueueSnackbar('Login successful', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', userData);
      setToken(response.data.data.token);
      setCurrentUser(response.data.data.user);
      enqueueSnackbar('Registration successful', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    try {
      if (token) {
        // Only call logout API if we have a token
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setCurrentUser(null);
      setLoading(false);
      enqueueSnackbar('Logged out successfully', { variant: 'success' });
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/auth/profile', userData);
      setCurrentUser(response.data.data);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      enqueueSnackbar('Password reset link sent to your email', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset link';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      enqueueSnackbar('Password reset successfully', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;