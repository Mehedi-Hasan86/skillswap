import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import GoogleButton from '../components/GoogleButton';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  function fill(email, password) {
    setForm({ email, password });
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <Navbar />
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-medium tracking-tight text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-2">Log in to find your next swap partner.</p>
        <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
          {err && <p className="rounded-lg bg-negative/10 px-3 py-2 text-sm font-medium text-negative">{err}</p>}
          <label className="block">
            <span className="label">Email</span>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required
              className="input mt-1" placeholder="you@student.local" />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required
              className="input mt-1" placeholder="••••••••" />
          </label>
          <button disabled={busy} className="btn btn-primary w-full">
            {busy ? 'Logging in…' : 'Log in'}
          </button>
          <p className="text-center text-sm text-ink-2">No account? <Link to="/register" className="font-medium text-accent-deep hover:underline">Join free</Link></p>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-ink-3">
          <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
        </div>
        <GoogleButton label="Sign in with Google" />
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <button onClick={() => fill('admin@skillswap.local', 'admin123')} className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-left transition hover:bg-raised">
            <span className="font-medium text-ink">Admin demo</span><br /><span className="text-ink-3">admin@skillswap.local</span>
          </button>
          <button onClick={() => fill('rahim@student.local', 'student123')} className="rounded-lg border border-hairline bg-surface px-3 py-2.5 text-left transition hover:bg-raised">
            <span className="font-medium text-ink">Student demo</span><br /><span className="text-ink-3">rahim@student.local</span>
          </button>
        </div>
      </div>
    </div>
  );
}
