import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

// Pre-seeded default user as initial fallback session
const DEFAULT_USER = {
  id: 1,
  name: 'Jaydon Frankie',
  email: 'jaydon@pulse.com',
  role: 'Senior Data Lead',
  token: 'token_default_session_active'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pulse_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pulse_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setUser(res.data);
        return { success: true };
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Invalid email or password';
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.signup(name, email, password, role);
      if (res.success) {
        setUser(res.data);
        return { success: true };
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Registration failed';
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pulse_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        authError,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
