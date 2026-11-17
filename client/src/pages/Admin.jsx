import { useEffect, useState } from 'react';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState('');
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Programming', description: '' });
  const [tab, setTab] = useState('overview');

  async function load() {
    try {
      const [s, u, sk, r] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/users'), api.get('/skills'), api.get('/reports'),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users || []);
      setSkills(sk.data.skills || []);
      setReports(r.data.reports || []);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to load admin data');
    }
  }

  useEffect(() => { load(); }, []);

  async function act(promise, ok) {
    setMsg('');
    try {
      await promise;
      if (ok) setMsg(ok);
      await load();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Action failed');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-black text-white">Admin control room 🛡️</h1>
        <p className="mt-1 text-sm text-slate-400">Users · skills · swaps · sessions · reports</p>
        {msg && <p className="mt-4 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-200">{msg}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {[['overview', 'Overview'], ['users', `Users (${users.length})`], ['skills', `Skills (${skills.length})`], ['reports', `Reports (${reports.filter((r) => r.status === 'pending').length} pending)`]].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === id ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>{l}</button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              ['👥 Users', stats.totalUsers],
              ['⏳ Pending req.', stats.pendingRequests],
              ['🔁 Active swaps', stats.activeSwaps],
              ['✅ Completed', stats.completedSessions],
              ['🚩 Reports', stats.pendingReports],
              ['🎯 Skills', stats.totalSkills],
            ].map(([t, v]) => (
              <Card key={t}><p className="text-xs font-bold text-slate-400">{t}</p><p className="mt-1 text-3xl font-black text-white">{v}</p></Card>
            ))}
            <Card className="md:col-span-3">
              <p className="font-extrabold text-white">Most requested skills</p>
              <div className="mt-3 space-y-2">
                {(stats.popularSkills || []).map((p) => (
                  <div key={p._id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-sm">
                    <span className="font-bold text-white">{p._id}</span>
                    <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-0.5 text-xs font-extrabold text-fuchsia-300">{p.count} requests</span>
                  </div>
                ))}
                {(stats.popularSkills || []).length === 0 && <p className="text-sm text-slate-500">No requests yet.</p>}
              </div>
            </Card>
            <Card className="md:col-span-3">
              <p className="font-extrabold text-white">Credit balances</p>
              <div className="mt-3 max-h-56 space-y-1.5 overflow-auto text-sm">
                {users.map((u) => (
                  <div key={u._id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span>{u.name} <span className="text-slate-500">({u.role})</span></span>
                    <span className="font-extrabold text-amber-300">✦ {u.credits}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'users' && (
          <Card className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="text-xs uppercase tracking-wider text-slate-500"><th className="py-2">User</th><th>Teach / Learn</th><th>Rating</th><th>Credits</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-white/5">
                      <td className="py-3 pr-4"><p className="font-bold text-white">{u.name}</p><p className="text-xs text-slate-500">{u.email} · {u.role}</p></td>
                      <td className="pr-4 text-xs text-slate-400">{(u.teachSkills || []).length} teach · {(u.learnSkills || []).length} learn</td>
                      <td className="pr-4">★ {u.avgRating || '–'} ({u.totalReviews || 0})</td>
                      <td className="pr-4 font-bold text-amber-300">✦ {u.credits}</td>
                      <td className="pr-4"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.status === 'active' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'}`}>{u.status}</span></td>
                      <td>{u.role !== 'admin' && (
                        u.status === 'active'
                          ? <button onClick={() => act(api.put(`/admin/users/${u._id}`, { status: 'suspended' }), `${u.name} suspended`)} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-300">Suspend</button>
                          : <button onClick={() => act(api.put(`/admin/users/${u._id}`, { status: 'active' }), `${u.name} reactivated`)} className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">Activate</button>
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 'skills' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card>
              <p className="font-extrabold text-white">Add skill to master list</p>
              <input value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="e.g. Figma" className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white" />
              <input value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} placeholder="Category" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white" />
              <input value={skillForm.description} onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })} placeholder="Short description" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white" />
              <button onClick={() => act(api.post('/skills', skillForm).then(() => setSkillForm({ name: '', category: 'Programming', description: '' })), 'Skill added!')} className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white">Add skill</button>
            </Card>
            <Card className="lg:col-span-2">
              <p className="font-extrabold text-white">Master skill list</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {skills.map((s) => (
                  <div key={s._id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm">
                    <div><p className="font-bold text-white">{s.name}</p><p className="text-xs text-slate-500">{s.category}</p></div>
                    <button onClick={() => act(api.delete(`/skills/${s._id}`), `Deleted ${s.name}`)} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-bold text-red-300">Delete</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'reports' && (
          <Card className="mt-6">
            <p className="font-extrabold text-white">Reports queue</p>
            <div className="mt-3 space-y-2">
              {reports.map((r) => (
                <div key={r._id} className="rounded-xl bg-white/5 p-4 text-sm">
                  <p className="font-bold text-white">{r.reason} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${r.status === 'pending' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>{r.status}</span></p>
                  <p className="mt-1 text-slate-400">Reporter: {r.reporter?.name || r.reporter} → Reported: {r.reportedUser?.name || r.reportedUser}</p>
                  {r.details && <p className="mt-1 text-slate-500">“{r.details}”</p>}
                  {r.status === 'pending' && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => act(api.put(`/reports/${r._id}`, { status: 'resolved', actionTaken: 'Reviewed — warning issued' }), 'Report resolved')} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">Resolve</button>
                      <button onClick={() => act(api.put(`/reports/${r._id}`, { status: 'dismissed', actionTaken: 'No violation found' }), 'Report dismissed')} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold">Dismiss</button>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && <p className="text-sm text-slate-500">No reports. 🎉</p>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
