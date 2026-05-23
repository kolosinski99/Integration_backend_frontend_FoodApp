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
    const newToken = data.token;
    const name = data.name || data.firstName || data.first_name || '';
    const newUser = {
      login: data.login || data.email || credentials.email || '',
      role: data.role || 'USER',
      name,
      surname: data.surname || '',
      street: data.street || '',
      houseNumber: data.house_number || data.houseNumber || '',
      apartmentNumber: data.apartment_number || data.apartmentNumber || null,
      postalCode: data.postal_code || data.postalCode || '',
      city: data.city || '',
      firstName: name,
      email: data.login || data.email || credentials.email || '',
    };
    setToken(newToken);
    setStoredUser(newUser);
    setTokenState(newToken);
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

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
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
