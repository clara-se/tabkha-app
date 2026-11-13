import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
  }

  async function signup(email, password) {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () =>
      window.removeEventListener('auth:expired', logout);
  }, []);

  const value = { token, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}