import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../lib/firebase';

export default function GoogleButton({ label = 'Continue with Google' }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function go() {
    setErr('');
    setBusy(true);
    try {
      const u = await loginWithGoogle();
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e) {
      const msg = e.message || '';
      let displayErr = e.response?.data?.error || msg || 'Google sign-in failed';
      if (msg.includes('auth/unauthorized-domain') || msg.includes('unauthorized-domain')) {
        displayErr = "Firebase Unauthorized Domain: Go to Firebase Console → Authentication → Settings → Authorized domains → Add 'localhost' or '127.0.0.1'.";
      }
      setErr(displayErr);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={go}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white py-3 font-bold text-slate-900 transition hover:bg-slate-200 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.7-.4-3.9z" />
        </svg>
        {busy ? 'Connecting…' : label}
      </button>
      {err && <p className="mt-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-300">{err}</p>}
      {!isFirebaseConfigured && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Google button needs <code className="text-slate-400">VITE_FIREBASE_*</code> keys in <code className="text-slate-400">client/.env</code> — email login works meanwhile.
        </p>
      )}
    </div>
  );
}
