import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import {
  signInWithGoogle,
  resumeGoogleSignIn,
  friendlyAuthError,
  onFirebaseAuthChanged,
  isReturningFromGoogleRedirect,
  clearGoogleRedirectFlag,
} from '../lib/firebase';

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

  async function exchangeFirebaseToken(idToken) {
    const { data } = await api.post('/auth/google', { idToken });
    localStorage.setItem('skillswap_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function finishGoogleSignIn(u) {
    clearGoogleRedirectFlag();
    sessionStorage.removeItem('skillswap_auth_error');
    // AuthProvider sits outside BrowserRouter, so a full navigation is used.
    window.location.replace(u.role === 'admin' ? '/admin' : '/dashboard');
  }

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};
    const returningFromRedirect = isReturningFromGoogleRedirect();

    (async () => {
      // 1. Normal redirect path: getRedirectResult() hands back the credential.
      try {
        const idToken = await resumeGoogleSignIn();
        if (idToken) {
          const u = await exchangeFirebaseToken(idToken);
          if (!cancelled) finishGoogleSignIn(u);
          return;
        }
      } catch (e) {
        // Show the failure on the login page once we get back (no router here).
        sessionStorage.setItem('skillswap_auth_error', friendlyAuthError(e));
      }

      // 2. Fallback: getRedirectResult() sometimes returns null (or throws)
      // even though Firebase restored the signed-in Google user from
      // persistence. onAuthStateChanged fires reliably in that case — without
      // it the app just sat on /login after a successful redirect sign-in.
      if (returningFromRedirect && !cancelled) {
        unsubscribe = onFirebaseAuthChanged(async (fbUser) => {
          if (!fbUser || cancelled) return;
          unsubscribe();
          try {
            const idToken = await fbUser.getIdToken();
            const u = await exchangeFirebaseToken(idToken);
            if (!cancelled) finishGoogleSignIn(u);
          } catch (e) {
            clearGoogleRedirectFlag();
            sessionStorage.setItem('skillswap_auth_error', friendlyAuthError(e));
          }
        });
      }

      await fetchMe();
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
    const { idToken, redirecting } = await signInWithGoogle();
    if (redirecting) return null; // page is navigating away; result handled on return
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
