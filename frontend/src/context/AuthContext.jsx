import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authStorage.getUser());
  const [token, setToken] = useState(authStorage.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const profile = await api.auth.getProfile();
          setUser(profile.user);
          authStorage.setUser(profile.user);
        } catch (err) {
          console.warn('Session expirée ou invalide:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    }
    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setToken(null);
  };

  const demoLogin = async (role) => {
    const creds = {
      admin: { email: 'admin@company.com', password: 'admin123' },
      manager: { email: 'manager@company.com', password: 'manager123' },
      employee1: { email: 'alice@company.com', password: 'alice123' },
      employee2: { email: 'bob@company.com', password: 'bob123' }
    };
    const target = creds[role] || creds.employee1;
    return login(target.email, target.password);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
