import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import GoogleButton from '../components/GoogleButton';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', availability: 'Flexible', mode: 'Both' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  const input = 'mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-indigo-400';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="text-3xl font-black text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">Free forever. Start with <b className="text-amber-300">2 Skill Credits</b>.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          {err && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-300">{err}</p>}
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Full name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={input} placeholder="Your name" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</span>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required className={input} placeholder="you@student.local" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Password (min 6)</span>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required minLength={6} className={input} placeholder="••••••••" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Availability</span>
              <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={input}>
                {['Flexible', 'Weekdays', 'Evenings', 'Weekends'].map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mode</span>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className={input}>
                {['Both', 'Online', 'Offline'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
          </div>
          <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50">
            {busy ? 'Creating…' : 'Join SkillSwap'}
          </button>
          <p className="text-center text-sm text-slate-500">Have an account? <Link to="/login" className="font-bold text-indigo-300">Log in</Link></p>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-slate-600">
          <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleButton label="Sign up with Google" />
      </div>
    </div>
  );
}
