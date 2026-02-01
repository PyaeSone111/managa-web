import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const response = await authApi.me();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_token');
        }
      } catch (error) {
        localStorage.removeItem('admin_token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Check if user is admin
        if (user.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }
        
        localStorage.setItem('admin_token', token);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      }
      throw new Error('Login failed');
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid credentials',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

