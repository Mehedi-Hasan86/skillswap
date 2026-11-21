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
    <div className="min-h-screen bg-page text-ink">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-medium tracking-tight text-ink">Admin · Overview</h1>
        <p className="mt-1 text-sm text-ink-2">Users, skills, swaps, sessions, reports</p>
        {msg && <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent-deep">{msg}</p>}

        <div className="mt-6 flex flex-wrap gap-1">
          {[['overview', 'Overview'], ['users', `Users (${users.length})`], ['skills', `Skills (${skills.length})`], ['reports', `Reports (${reports.filter((r) => r.status === 'pending').length} pending)`]].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`tab ${tab === id ? 'tab-active' : ''}`}>{l}</button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              ['Users', stats.totalUsers],
              ['Pending req.', stats.pendingRequests],
              ['Active swaps', stats.activeSwaps],
              ['Completed', stats.completedSessions],
              ['Reports', stats.pendingReports],
              ['Skills', stats.totalSkills],
            ].map(([t, v]) => (
              <Card key={t}><p className="text-xs text-ink-3">{t}</p><p className="mono mt-1 text-3xl font-medium text-ink">{v}</p></Card>
            ))}
            <Card className="md:col-span-3">
              <p className="font-medium text-ink">Most requested skills</p>
              <div className="mt-3 space-y-2">
                {(stats.popularSkills || []).map((p) => (
                  <div key={p._id} className="flex items-center justify-between rounded-lg bg-raised px-4 py-2.5 text-sm">
                    <span className="font-medium text-ink">{p._id}</span>
                    <span className="mono text-sm text-accent-deep">{p.count} requests</span>
                  </div>
                ))}
                {(stats.popularSkills || []).length === 0 && <p className="text-sm text-ink-3">No requests yet.</p>}
              </div>
            </Card>
            <Card className="md:col-span-3">
              <p className="font-medium text-ink">Credit balances</p>
              <div className="mt-3 max-h-56 space-y-1.5 overflow-auto text-sm">
                {users.map((u) => (
                  <div key={u._id} className="flex justify-between rounded-lg bg-raised px-3 py-2">
                    <span className="text-ink-2">{u.name} <span className="text-ink-3">({u.role})</span></span>
                    <span className="mono font-medium text-accent-deep">{u.credits}</span>
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
                <thead><tr className="text-xs font-medium text-ink-3"><th className="py-2">User</th><th>Teach / Learn</th><th>Rating</th><th>Credits</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-hairline">
                      <td className="py-3 pr-4"><p className="font-medium text-ink">{u.name}</p><p className="text-xs text-ink-3">{u.email} · {u.role}</p></td>
                      <td className="pr-4 text-xs text-ink-2">{(u.teachSkills || []).length} teach · {(u.learnSkills || []).length} learn</td>
                      <td className="mono pr-4">{u.avgRating || '–'} ({u.totalReviews || 0})</td>
                      <td className="mono pr-4 font-medium text-accent-deep">{u.credits}</td>
                      <td className="pr-4"><span className={`mono rounded-md px-2 py-0.5 text-xs font-medium ${u.status === 'active' ? 'bg-positive/15 text-positive' : 'bg-negative/15 text-negative'}`}>{u.status}</span></td>
                      <td>{u.role !== 'admin' && (
                        u.status === 'active'
                          ? <button onClick={() => act(api.put(`/admin/users/${u._id}`, { status: 'suspended' }), `${u.name} suspended`)} className="btn btn-sm bg-negative/10 text-negative">Suspend</button>
                          : <button onClick={() => act(api.put(`/admin/users/${u._id}`, { status: 'active' }), `${u.name} reactivated`)} className="btn btn-sm bg-positive/10 text-positive">Activate</button>
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
              <p className="font-medium text-ink">Add skill to master list</p>
              <input value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="e.g. Figma" className="input mt-3" />
              <input value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} placeholder="Category" className="input mt-2" />
              <input value={skillForm.description} onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })} placeholder="Short description" className="input mt-2" />
              <button onClick={() => act(api.post('/skills', skillForm).then(() => setSkillForm({ name: '', category: 'Programming', description: '' })), 'Skill added')} className="btn btn-primary mt-2 w-full">Add skill</button>
            </Card>
            <Card className="lg:col-span-2">
              <p className="font-medium text-ink">Master skill list</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {skills.map((s) => (
                  <div key={s._id} className="flex items-center justify-between rounded-xl bg-raised px-3 py-2.5 text-sm">
                    <div><p className="font-medium text-ink">{s.name}</p><p className="text-xs text-ink-3">{s.category}</p></div>
                    <button onClick={() => act(api.delete(`/skills/${s._id}`), `Deleted ${s.name}`)} className="btn btn-sm bg-negative/10 text-negative">Delete</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'reports' && (
          <Card className="mt-6">
            <p className="font-medium text-ink">Reports queue</p>
            <div className="mt-3 space-y-2">
              {reports.map((r) => (
                <div key={r._id} className="rounded-xl bg-raised p-4 text-sm">
                  <p className="font-medium text-ink">{r.reason} <span className={`mono ml-2 rounded-md px-2 py-0.5 text-xs ${r.status === 'pending' ? 'bg-amber-500/15 text-amber-700' : 'bg-positive/15 text-positive'}`}>{r.status}</span></p>
                  <p className="mt-1 text-ink-2">Reporter: {r.reporter?.name || r.reporter} → Reported: {r.reportedUser?.name || r.reportedUser}</p>
                  {r.details && <p className="mt-1 text-ink-3">{r.details}</p>}
                  {r.status === 'pending' && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => act(api.put(`/reports/${r._id}`, { status: 'resolved', actionTaken: 'Reviewed — warning issued' }), 'Report resolved')} className="btn btn-sm bg-positive text-surface">Resolve</button>
                      <button onClick={() => act(api.put(`/reports/${r._id}`, { status: 'dismissed', actionTaken: 'No violation found' }), 'Report dismissed')} className="btn btn-sm bg-raised text-ink">Dismiss</button>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && <p className="text-sm text-ink-3">No reports.</p>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
