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
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-black text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Log in to find your next swap partner.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          {err && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-300">{err}</p>}
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</span>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-indigo-400" placeholder="you@student.local" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</span>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-indigo-400" placeholder="••••••••" />
          </label>
          <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50">
            {busy ? 'Logging in…' : 'Log in'}
          </button>
          <p className="text-center text-sm text-slate-500">No account? <Link to="/register" className="font-bold text-indigo-300 hover:text-indigo-200">Join free</Link></p>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-slate-600">
          <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleButton label="Sign in with Google" />
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <button onClick={() => fill('admin@skillswap.local', 'admin123')} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10">
            <span className="font-bold text-white">Admin demo</span><br /><span className="text-slate-500">admin@skillswap.local</span>
          </button>
          <button onClick={() => fill('rahim@student.local', 'student123')} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10">
            <span className="font-bold text-white">Student demo</span><br /><span className="text-slate-500">rahim@student.local</span>
          </button>
        </div>
      </div>
    </div>
  );
}
