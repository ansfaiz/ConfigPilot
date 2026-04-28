/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('cp_token'));

  useEffect(() => {
    const token = localStorage.getItem('cp_token');
    if (!token) return;

    api.get('/auth/me', { skipToast: true })
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('cp_token');
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem('cp_token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('cp_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
