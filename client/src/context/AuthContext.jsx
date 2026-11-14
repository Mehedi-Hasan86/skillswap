import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { signInWithGooglePopup } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    const token = localStorage.getItem('skillswap_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('skillswap_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('skillswap_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('skillswap_token', data.token);
    setUser(data.user);
    return data.user;
  }

  // Google Sign-In: Firebase popup → ID token → our backend verifies it
  // with Firebase Admin and returns the SkillSwap JWT.
  async function loginWithGoogle() {
    const idToken = await signInWithGooglePopup();
    const { data } = await api.post('/auth/google', { idToken });
    localStorage.setItem('skillswap_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('skillswap_token');
    setUser(null);
  }

  async function refresh() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
