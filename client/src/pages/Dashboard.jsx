import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Card, ScoreRing, SkillChip, Stars } from '../components/ui';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState('overview');
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [credits, setCredits] = useState({ credits: 0, history: [] });
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  // forms
  const [skillForm, setSkillForm] = useState({ skillName: '', level: 'Beginner', type: 'teach' });
  const [profile, setProfile] = useState({ name: '', bio: '', availability: 'Flexible', mode: 'Both' });
  const [reqForm, setReqForm] = useState({ toUserId: '', teachSkill: '', learnSkill: '', message: '' });
  const [schedForm, setSchedForm] = useState({ requestId: '', date: '', time: '', mode: 'Online', location: '' });
  const [reviewForm, setReviewForm] = useState({ sessionId: '', rating: 5, comment: '' });
  const [reportForm, setReportForm] = useState({ reportedUserId: '', reason: 'Inappropriate behavior', details: '' });

  async function load() {
    try {
      const [m, r, s, sk, c] = await Promise.all([
        api.get('/users/matches', { params: { search } }),
        api.get('/requests'),
        api.get('/sessions'),
        api.get('/skills'),
        api.get('/credits/balance'),
      ]);
      setMatches(m.data.matches || []);
      setRequests(r.data.requests || []);
      setSessions(s.data.sessions || []);
      setSkills(sk.data.skills || []);
      setCredits(c.data);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to load');
    }
  }

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', bio: user.bio || '', availability: user.availability || 'Flexible', mode: user.mode || 'Both' });
    }
  }, [user]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function act(promise, okMsg) {
    setMsg('');
    try {
      await promise;
      if (okMsg) setMsg(okMsg);
      await load();
      await refresh();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Action failed');
    }
  }

  const incoming = requests.filter((r) => String(r.toUser?._id || r.toUser) === String(user?._id) && r.status === 'pending');
  const outgoing = requests.filter((r) => String(r.fromUser?._id || r.fromUser) === String(user?._id));
  const accepted = requests.filter((r) => r.status === 'accepted');
  const upcoming = sessions.filter((s) => s.status === 'Scheduled');
  const done = sessions.filter((s) => s.status === 'Completed');

  const tabs = [
    ['overview', 'Overview'],
    ['matches', `Matches (${matches.length})`],
    ['requests', `Requests (${incoming.length} new)`],
    ['sessions', `Sessions (${upcoming.length})`],
    ['profile', 'Profile & Skills'],
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="mt-1 text-sm text-slate-400">“I know X, want to learn Y” — let's find your people.</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-xl bg-amber-400/15 px-4 py-2 text-sm font-extrabold text-amber-300">✦ {credits.credits ?? user?.credits ?? 0} credits</span>
            <span className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-white">★ {user?.avgRating || '–'} ({user?.totalReviews || 0})</span>
          </div>
        </div>

        {msg && <p className="mt-4 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-200">{msg}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === id ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ['✦ Credits', credits.credits ?? 0, 'Teach to earn +1'],
              ['🔁 Pending requests', incoming.length, 'Needs your response'],
              ['📅 Upcoming', upcoming.length, 'Scheduled sessions'],
              ['✅ Completed', done.length, 'Sessions finished'],
            ].map(([t, v, d]) => (
              <Card key={t}>
                <p className="text-sm font-semibold text-slate-400">{t}</p>
                <p className="mt-1 text-4xl font-black text-white">{v}</p>
                <p className="mt-1 text-xs text-slate-500">{d}</p>
              </Card>
            ))}
            <Card className="md:col-span-2">
              <p className="font-extrabold text-white">Top 3 matches right now</p>
              <div className="mt-3 space-y-2">
                {matches.slice(0, 3).map((m) => (
                  <div key={m.user._id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                    <span className="text-sm font-bold text-white">{m.user.name}</span>
                    <ScoreRing score={m.score} />
                  </div>
                ))}
                {matches.length === 0 && <p className="text-sm text-slate-500">Add teach/learn skills in Profile to get matches.</p>}
              </div>
            </Card>
            <Card className="md:col-span-2">
              <p className="font-extrabold text-white">Credit history</p>
              <div className="mt-3 space-y-1.5 text-sm">
                {(credits.history || []).slice(0, 5).map((t) => (
                  <div key={t._id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-slate-300">{t.reason}</span>
                    <span className={`font-extrabold ${t.delta > 0 ? 'text-emerald-300' : 'text-red-300'}`}>{t.delta > 0 ? '+' : ''}{t.delta}</span>
                  </div>
                ))}
                {(!credits.history || credits.history.length === 0) && <p className="text-slate-500">Complete a teaching session to earn your first credit.</p>}
              </div>
            </Card>
          </div>
        )}

        {tab === 'matches' && (
          <div className="mt-6">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or skill…"
              className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-indigo-400" />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {matches.map((m) => (
                <Card key={m.user._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold text-white">{m.user.name} <Stars value={m.user.avgRating} /></p>
                      <p className="text-xs text-slate-500">{m.user.availability} · {m.user.mode} · {(m.user.badges || []).join(', ') || 'New member'}</p>
                    </div>
                    <ScoreRing score={m.score} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(m.user.teachSkills || []).map((s) => <SkillChip key={'t' + s.skillName} name={s.skillName} level={s.level} tone="teach" />)}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(m.user.learnSkills || []).map((s) => <SkillChip key={'l' + s.skillName} name={s.skillName} level={s.level} tone="learn" />)}
                  </div>
                  {m.perfect && <p className="mt-2 text-xs font-bold text-emerald-300">✨ Perfect two-way swap — free to request</p>}
                  {!m.perfect && <p className="mt-2 text-xs text-slate-500">One-way match — costs 1 credit to request</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <select value={reqForm.toUserId === m.user._id ? reqForm.teachSkill : ''} onChange={(e) => setReqForm({ ...reqForm, toUserId: m.user._id, teachSkill: e.target.value, learnSkill: reqForm.learnSkill })}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white">
                      <option value="">You teach…</option>
                      {(user?.teachSkills || []).map((s) => <option key={s.skillName} value={s.skillName}>{s.skillName}</option>)}
                    </select>
                    <select value={reqForm.toUserId === m.user._id ? reqForm.learnSkill : ''} onChange={(e) => setReqForm({ ...reqForm, toUserId: m.user._id, learnSkill: e.target.value, teachSkill: reqForm.teachSkill })}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white">
                      <option value="">You learn…</option>
                      {(m.user.teachSkills || []).map((s) => <option key={s.skillName} value={s.skillName}>{s.skillName}</option>)}
                    </select>
                  </div>
                  <button onClick={() => act(api.post('/requests', { toUserId: m.user._id, teachSkill: reqForm.toUserId === m.user._id && reqForm.teachSkill ? reqForm.teachSkill : (user?.teachSkills?.[0]?.skillName || 'General'), learnSkill: reqForm.toUserId === m.user._id && reqForm.learnSkill ? reqForm.learnSkill : (m.user.teachSkills?.[0]?.skillName || 'General'), message: '' }), 'Swap request sent!')}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
                    Send swap request
                  </button>
                </Card>
              ))}
              {matches.length === 0 && <p className="text-slate-500">No matches yet — add skills in the Profile tab.</p>}
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="font-extrabold text-white">Incoming ({incoming.length})</p>
              <div className="mt-3 space-y-2">
                {requests.filter((r) => String(r.toUser?._id || r.toUser) === String(user?._id)).map((r) => (
                  <div key={r._id} className="rounded-xl bg-white/5 p-3 text-sm">
                    <p className="font-bold text-white">{r.fromUser?.name} → you <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${r.status === 'pending' ? 'bg-amber-400/20 text-amber-300' : r.status === 'accepted' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>{r.status}</span></p>
                    <p className="mt-1 text-slate-400">They teach <b className="text-emerald-300">{r.teachSkill}</b> · want <b className="text-sky-300">{r.learnSkill}</b> · score {r.matchScore}</p>
                    {r.status === 'pending' && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => act(api.put(`/requests/${r._id}/accept`), 'Request accepted — now schedule a session!')} className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-white">Accept</button>
                        <button onClick={() => act(api.put(`/requests/${r._id}/reject`), 'Request rejected')} className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-bold text-white">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="font-extrabold text-white">Outgoing ({outgoing.length})</p>
              <div className="mt-3 space-y-2">
                {outgoing.map((r) => (
                  <div key={r._id} className="rounded-xl bg-white/5 p-3 text-sm">
                    <p className="font-bold text-white">You → {r.toUser?.name} <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{r.status}</span></p>
                    <p className="mt-1 text-slate-400">You teach <b className="text-emerald-300">{r.teachSkill}</b> · learn <b className="text-sky-300">{r.learnSkill}</b></p>
                    {r.status === 'pending' && <button onClick={() => act(api.put(`/requests/${r._id}/cancel`), 'Request cancelled')} className="mt-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold">Cancel</button>}
                  </div>
                ))}
                {outgoing.length === 0 && <p className="text-sm text-slate-500">No outgoing requests — go to Matches.</p>}
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-extrabold text-white">Schedule a session (from accepted request)</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={schedForm.requestId} onChange={(e) => setSchedForm({ ...schedForm, requestId: e.target.value })} className="col-span-2 rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white">
                    <option value="">Select accepted request…</option>
                    {accepted.map((r) => <option key={r._id} value={r._id}>{(r.fromUser?.name || '')} ⇄ {(r.toUser?.name || '')} · {r.teachSkill} ⇄ {r.learnSkill}</option>)}
                  </select>
                  <input type="date" value={schedForm.date} onChange={(e) => setSchedForm({ ...schedForm, date: e.target.value })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white" />
                  <input type="time" value={schedForm.time} onChange={(e) => setSchedForm({ ...schedForm, time: e.target.value })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white" />
                  <select value={schedForm.mode} onChange={(e) => setSchedForm({ ...schedForm, mode: e.target.value })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white">
                    <option>Online</option><option>Offline</option>
                  </select>
                  <input value={schedForm.location} onChange={(e) => setSchedForm({ ...schedForm, location: e.target.value })} placeholder="Link / location" className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white" />
                </div>
                <button onClick={() => act(api.post('/sessions', schedForm), 'Session scheduled!')} className="mt-2 w-full rounded-xl bg-white py-2.5 text-sm font-extrabold text-slate-900">Schedule session</button>
              </div>
            </Card>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <p className="font-extrabold text-white">My sessions</p>
              <div className="mt-3 space-y-2">
                {sessions.map((s) => (
                  <div key={s._id} className="rounded-xl bg-white/5 p-3 text-sm">
                    <p className="font-bold text-white">{s.topic} <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">{s.status}</span></p>
                    <p className="mt-1 text-slate-400">{s.date} · {s.time} · {s.durationMins} min · {s.mode} {s.location && `· ${s.location}`}</p>
                    <p className="text-xs text-slate-500">With: {(s.participants || []).filter((p) => String(p._id) !== String(user?._id)).map((p) => p.name).join(', ')}</p>
                    {s.status === 'Scheduled' && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => act(api.put(`/sessions/${s._id}/complete`), 'Session completed — teacher earned +1 credit!')} className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-white">Mark completed</button>
                        <button onClick={() => act(api.put(`/sessions/${s._id}/cancel`), 'Session cancelled')} className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-bold">Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-sm text-slate-500">No sessions yet.</p>}
              </div>
            </Card>
            <div className="space-y-4">
              <Card>
                <p className="font-extrabold text-white">Rate a completed session</p>
                <select value={reviewForm.sessionId} onChange={(e) => setReviewForm({ ...reviewForm, sessionId: e.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white">
                  <option value="">Select completed session…</option>
                  {done.map((s) => <option key={s._id} value={s._id}>{s.topic} · {s.date}</option>)}
                </select>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} className={`flex-1 rounded-lg py-2 text-lg ${reviewForm.rating >= n ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-slate-600'}`}>★</button>
                  ))}
                </div>
                <input value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="What was great?" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white" />
                <button onClick={() => act(api.post('/reviews', reviewForm), 'Review submitted!')} className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-500 py-2.5 text-sm font-bold text-slate-950">Submit ★ review</button>
              </Card>
              <Card>
                <p className="font-extrabold text-white">Report a user</p>
                <input value={reportForm.reportedUserId} onChange={(e) => setReportForm({ ...reportForm, reportedUserId: e.target.value })} placeholder="Paste reported user ID (from profile)" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white" />
                <select value={reportForm.reason} onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs text-white">
                  <option>Inappropriate behavior</option><option>Spam</option><option>No-show</option><option>Fake skills</option><option>Other</option>
                </select>
                <input value={reportForm.details} onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })} placeholder="Details…" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white" />
                <button onClick={() => act(api.post('/reports', reportForm), 'Report submitted for admin review')} className="mt-2 w-full rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white">Submit report</button>
              </Card>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="font-extrabold text-white">Edit profile</p>
              <div className="mt-3 space-y-3 text-sm">
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-white" />
                <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Bio — what do you love teaching?" rows={3} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2.5 text-white">
                    {['Flexible', 'Weekdays', 'Evenings', 'Weekends'].map((a) => <option key={a}>{a}</option>)}
                  </select>
                  <select value={profile.mode} onChange={(e) => setProfile({ ...profile, mode: e.target.value })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2.5 text-white">
                    {['Both', 'Online', 'Offline'].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <button onClick={() => act(api.put('/users/profile', profile), 'Profile saved!')} className="w-full rounded-xl bg-white py-2.5 font-extrabold text-slate-900">Save profile</button>
                <p className="text-xs text-slate-500">Your ID (for reports): <code className="text-slate-300">{user?._id}</code></p>
              </div>
            </Card>
            <Card>
              <p className="font-extrabold text-white">My skills</p>
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Can teach</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(user?.teachSkills || []).map((s) => (
                    <button key={s.skillName} title="Click to remove" onClick={() => act(api.delete('/users/skills', { params: { skillName: s.skillName, type: 'teach' } }), `Removed ${s.skillName}`)}>
                      <SkillChip name={s.skillName} level={s.level} tone="teach" />
                    </button>
                  ))}
                  {(user?.teachSkills || []).length === 0 && <span className="text-xs text-slate-500">None yet</span>}
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-sky-300">Want to learn</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(user?.learnSkills || []).map((s) => (
                    <button key={s.skillName} title="Click to remove" onClick={() => act(api.delete('/users/skills', { params: { skillName: s.skillName, type: 'learn' } }), `Removed ${s.skillName}`)}>
                      <SkillChip name={s.skillName} level={s.level} tone="learn" />
                    </button>
                  ))}
                  {(user?.learnSkills || []).length === 0 && <span className="text-xs text-slate-500">None yet</span>}
                </div>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-extrabold text-white">Add a skill</p>
                <select value={skillForm.skillName} onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white">
                  <option value="">Choose from admin list…</option>
                  {skills.map((s) => <option key={s._id} value={s.name}>{s.name} ({s.category})</option>)}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2.5 text-sm text-white">
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <select value={skillForm.type} onChange={(e) => setSkillForm({ ...skillForm, type: e.target.value })} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-2.5 text-sm text-white">
                    <option value="teach">Can teach</option><option value="learn">Want to learn</option>
                  </select>
                </div>
                <button onClick={() => act(api.post('/users/skills', skillForm), 'Skill added!')} className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white">Add skill</button>
                <p className="mt-2 text-xs text-slate-500">Click a chip to remove it. Missing a skill? Ask an admin to add it.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
