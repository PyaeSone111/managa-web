import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api';
import { AUTH_TOKEN_KEY } from '../utils/constants';
import { getItem, removeItem, setItem } from '../services/storage';

const AuthContext = createContext(null);

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

  const checkAuth = useCallback(async () => {
    const token = await getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch {
      await removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    await setItem(AUTH_TOKEN_KEY, response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    await setItem(AUTH_TOKEN_KEY, response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      await removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
