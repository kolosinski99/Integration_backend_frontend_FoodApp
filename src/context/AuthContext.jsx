import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../api/authApi';
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearSession,
} from '../utils/token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const data = response.data || {};

    const newUser = {
      login: data.login || credentials.email || '',
      role: data.role || 'USER',
      name: data.name || '',
      surname: data.surname || '',
      firstName: data.name || '',
      email: data.login || credentials.email || '',
    };

    setToken(data.token);
    setStoredUser(newUser);
    setTokenState(data.token);
    setUser(newUser);
    return newUser;
  };

  const register = async (data) => {
    const response = await registerUser(data);
    return response.data;
  };

  const logout = () => {
    clearSession();
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updatedFields };
      if (updatedFields.name !== undefined) next.firstName = updatedFields.name;
      setStoredUser(next);
      return next;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
