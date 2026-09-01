import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if we have a stored token and fetch the current user
  useEffect(() => {
    const token = localStorage.getItem('kobobuy_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('kobobuy_token'))
      .finally(() => setLoading(false));
  }, []);

  // Shared by every auth flow that ends in "here's a user + token" —
  // normal login, both registration flows, and Google sign-in — so each
  // just needs to get that response and hand it here.
  const applyAuthResponse = (data) => {
    localStorage.setItem('kobobuy_token', data.token);
    setUser(data);
    return data;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return applyAuthResponse(res.data);
  };

  const loginWithGoogle = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    return applyAuthResponse(res.data);
  };

  const registerCustomer = async (formData) => {
    const res = await api.post('/auth/register', formData);
    localStorage.setItem('kobobuy_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const registerVendor = async (formData) => {
    const res = await api.post('/auth/register-vendor', formData);
    localStorage.setItem('kobobuy_token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('kobobuy_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, registerCustomer, registerVendor, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
