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

  return (
    <div className="min-h-screen bg-page text-ink">
      <Navbar />
      <div className="mx-auto max-w-md px-6 py-14">
        <h1 className="text-3xl font-medium tracking-tight text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-ink-2">Free forever. Start with <b className="font-medium text-accent-deep">2 Skill Credits</b>.</p>
        <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
          {err && <p className="rounded-lg bg-negative/10 px-3 py-2 text-sm font-medium text-negative">{err}</p>}
          <label className="block">
            <span className="label">Full name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input mt-1" placeholder="Your name" />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required className="input mt-1" placeholder="you@student.local" />
          </label>
          <label className="block">
            <span className="label">Password (min 6)</span>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required minLength={6} className="input mt-1" placeholder="••••••••" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Availability</span>
              <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="input mt-1">
                {['Flexible', 'Weekdays', 'Evenings', 'Weekends'].map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Mode</span>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="input mt-1">
                {['Both', 'Online', 'Offline'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
          </div>
          <button disabled={busy} className="btn btn-primary w-full">
            {busy ? 'Creating…' : 'Join SkillSwap'}
          </button>
          <p className="text-center text-sm text-ink-2">Have an account? <Link to="/login" className="font-medium text-accent-deep hover:underline">Log in</Link></p>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-ink-3">
          <span className="h-px flex-1 bg-hairline" /> or <span className="h-px flex-1 bg-hairline" />
        </div>
        <GoogleButton label="Sign up with Google" />
      </div>
    </div>
  );
}
