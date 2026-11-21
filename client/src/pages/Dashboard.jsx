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
    <div className="min-h-screen bg-page text-ink">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-ink">{user?.name?.split(' ')[0]} · Overview</h1>
            <p className="mt-1 text-sm text-ink-2">I know X, want to learn Y — find your people.</p>
          </div>
          <div className="flex gap-2">
            <span className="mono rounded-lg border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink">{credits.credits ?? user?.credits ?? 0} credits</span>
            <span className="mono rounded-lg border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink">{user?.avgRating || '–'} ({user?.totalReviews || 0})</span>
          </div>
        </div>

        {msg && <p className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent-deep">{msg}</p>}

        <div className="mt-6 flex flex-wrap gap-1">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`tab ${tab === id ? 'tab-active' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ['Credits', credits.credits ?? 0, 'Teach to earn +1'],
              ['Pending requests', incoming.length, 'Needs your response'],
              ['Upcoming', upcoming.length, 'Scheduled sessions'],
              ['Completed', done.length, 'Sessions finished'],
            ].map(([t, v, d]) => (
              <Card key={t}>
                <p className="text-sm text-ink-3">{t}</p>
                <p className="mono mt-1 text-4xl font-medium text-ink">{v}</p>
                <p className="mt-1 text-xs text-ink-3">{d}</p>
              </Card>
            ))}
            <Card className="md:col-span-2">
              <p className="font-medium text-ink">Top 3 matches right now</p>
              <div className="mt-3 space-y-2">
                {matches.slice(0, 3).map((m) => (
                  <div key={m.user._id} className="flex items-center justify-between rounded-lg bg-raised px-3 py-2.5">
                    <span className="text-sm font-medium text-ink">{m.user.name}</span>
                    <ScoreRing score={m.score} />
                  </div>
                ))}
                {matches.length === 0 && <p className="text-sm text-ink-3">Add teach/learn skills in Profile to get matches.</p>}
              </div>
            </Card>
            <Card className="md:col-span-2">
              <p className="font-medium text-ink">Credit history</p>
              <div className="mt-3 space-y-1.5 text-sm">
                {(credits.history || []).slice(0, 5).map((t) => (
                  <div key={t._id} className="flex justify-between rounded-lg bg-raised px-3 py-2">
                    <span className="text-ink-2">{t.reason}</span>
                    <span className={`mono font-medium ${t.delta > 0 ? 'text-positive' : 'text-negative'}`}>{t.delta > 0 ? '+' : ''}{t.delta}</span>
                  </div>
                ))}
                {(!credits.history || credits.history.length === 0) && <p className="text-ink-3">Complete a teaching session to earn your first credit.</p>}
              </div>
            </Card>
          </div>
        )}

        {tab === 'matches' && (
          <div className="mt-6">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or skill"
              className="input max-w-md" />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {matches.map((m) => (
                <Card key={m.user._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-medium text-ink">{m.user.name} <Stars value={m.user.avgRating} /></p>
                      <p className="text-xs text-ink-3">{m.user.availability} · {m.user.mode} · {(m.user.badges || []).join(', ') || 'New member'}</p>
                    </div>
                    <ScoreRing score={m.score} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(m.user.teachSkills || []).map((s) => <SkillChip key={'t' + s.skillName} name={s.skillName} level={s.level} tone="teach" />)}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(m.user.learnSkills || []).map((s) => <SkillChip key={'l' + s.skillName} name={s.skillName} level={s.level} tone="learn" />)}
                  </div>
                  {m.perfect ? <p className="mt-2 text-xs font-medium text-positive">Perfect two-way swap — free to request</p> : <p className="mt-2 text-xs text-ink-3">One-way match — costs 1 credit to request</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <select value={reqForm.toUserId === m.user._id ? reqForm.teachSkill : ''} onChange={(e) => setReqForm({ ...reqForm, toUserId: m.user._id, teachSkill: e.target.value, learnSkill: reqForm.learnSkill })}
                      className="input px-2 py-2 text-xs">
                      <option value="">You teach…</option>
                      {(user?.teachSkills || []).map((s) => <option key={s.skillName} value={s.skillName}>{s.skillName}</option>)}
                    </select>
                    <select value={reqForm.toUserId === m.user._id ? reqForm.learnSkill : ''} onChange={(e) => setReqForm({ ...reqForm, toUserId: m.user._id, learnSkill: e.target.value, teachSkill: reqForm.teachSkill })}
                      className="input px-2 py-2 text-xs">
                      <option value="">You learn…</option>
                      {(m.user.teachSkills || []).map((s) => <option key={s.skillName} value={s.skillName}>{s.skillName}</option>)}
                    </select>
                  </div>
                  <button onClick={() => act(api.post('/requests', { toUserId: m.user._id, teachSkill: reqForm.toUserId === m.user._id && reqForm.teachSkill ? reqForm.teachSkill : (user?.teachSkills?.[0]?.skillName || 'General'), learnSkill: reqForm.toUserId === m.user._id && reqForm.learnSkill ? reqForm.learnSkill : (m.user.teachSkills?.[0]?.skillName || 'General'), message: '' }), 'Swap request sent')}
                    className="btn btn-primary mt-2 w-full">
                    Send swap request
                  </button>
                </Card>
              ))}
              {matches.length === 0 && <p className="text-ink-3">No matches yet — add skills in the Profile tab.</p>}
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="font-medium text-ink">Incoming ({incoming.length})</p>
              <div className="mt-3 space-y-2">
                {requests.filter((r) => String(r.toUser?._id || r.toUser) === String(user?._id)).map((r) => (
                  <div key={r._id} className="rounded-xl bg-raised p-3 text-sm">
                    <p className="font-medium text-ink">{r.fromUser?.name} → you <span className={`mono ml-2 rounded-md px-2 py-0.5 text-xs ${r.status === 'pending' ? 'bg-amber-500/15 text-amber-700' : r.status === 'accepted' ? 'bg-positive/15 text-positive' : 'bg-ink/8 text-ink-3'}`}>{r.status}</span></p>
                    <p className="mt-1 text-ink-2">They teach <b className="font-medium text-positive">{r.teachSkill}</b> · want <b className="font-medium text-sky-700">{r.learnSkill}</b> · score {r.matchScore}</p>
                    {r.status === 'pending' && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => act(api.put(`/requests/${r._id}/accept`), 'Request accepted — now schedule a session')} className="btn btn-sm flex-1 bg-positive text-surface">Accept</button>
                        <button onClick={() => act(api.put(`/requests/${r._id}/reject`), 'Request rejected')} className="btn btn-sm flex-1 bg-raised text-ink">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="font-medium text-ink">Outgoing ({outgoing.length})</p>
              <div className="mt-3 space-y-2">
                {outgoing.map((r) => (
                  <div key={r._id} className="rounded-xl bg-raised p-3 text-sm">
                    <p className="font-medium text-ink">You → {r.toUser?.name} <span className="mono ml-2 rounded-md bg-ink/8 px-2 py-0.5 text-xs text-ink-3">{r.status}</span></p>
                    <p className="mt-1 text-ink-2">You teach <b className="font-medium text-positive">{r.teachSkill}</b> · learn <b className="font-medium text-sky-700">{r.learnSkill}</b></p>
                    {r.status === 'pending' && <button onClick={() => act(api.put(`/requests/${r._id}/cancel`), 'Request cancelled')} className="btn btn-sm mt-2 bg-raised text-ink">Cancel</button>}
                  </div>
                ))}
                {outgoing.length === 0 && <p className="text-sm text-ink-3">No outgoing requests — go to Matches.</p>}
              </div>
              <div className="mt-4 border-t border-hairline pt-4">
                <p className="text-sm font-medium text-ink">Schedule a session (from accepted request)</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={schedForm.requestId} onChange={(e) => setSchedForm({ ...schedForm, requestId: e.target.value })} className="input col-span-2 px-2 py-2 text-xs">
                    <option value="">Select accepted request…</option>
                    {accepted.map((r) => <option key={r._id} value={r._id}>{(r.fromUser?.name || '')} ⇄ {(r.toUser?.name || '')} · {r.teachSkill} ⇄ {r.learnSkill}</option>)}
                  </select>
                  <input type="date" value={schedForm.date} onChange={(e) => setSchedForm({ ...schedForm, date: e.target.value })} className="input px-2 py-2 text-xs" />
                  <input type="time" value={schedForm.time} onChange={(e) => setSchedForm({ ...schedForm, time: e.target.value })} className="input px-2 py-2 text-xs" />
                  <select value={schedForm.mode} onChange={(e) => setSchedForm({ ...schedForm, mode: e.target.value })} className="input px-2 py-2 text-xs">
                    <option>Online</option><option>Offline</option>
                  </select>
                  <input value={schedForm.location} onChange={(e) => setSchedForm({ ...schedForm, location: e.target.value })} placeholder="Link / location" className="input px-2 py-2 text-xs" />
                </div>
                <button onClick={() => act(api.post('/sessions', schedForm), 'Session scheduled')} className="btn btn-primary mt-2 w-full">Schedule session</button>
              </div>
            </Card>
          </div>
        )}

        {tab === 'sessions' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <p className="font-medium text-ink">My sessions</p>
              <div className="mt-3 space-y-2">
                {sessions.map((s) => (
                  <div key={s._id} className="rounded-xl bg-raised p-3 text-sm">
                    <p className="font-medium text-ink">{s.topic} <span className="mono ml-2 rounded-md bg-ink/8 px-2 py-0.5 text-xs text-ink-3">{s.status}</span></p>
                    <p className="mt-1 text-ink-2">{s.date} · {s.time} · {s.durationMins} min · {s.mode} {s.location && `· ${s.location}`}</p>
                    <p className="text-xs text-ink-3">With: {(s.participants || []).filter((p) => String(p._id) !== String(user?._id)).map((p) => p.name).join(', ')}</p>
                    {s.status === 'Scheduled' && (
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => act(api.put(`/sessions/${s._id}/complete`), 'Session completed — teacher earned +1 credit')} className="btn btn-sm flex-1 bg-positive text-surface">Mark completed</button>
                        <button onClick={() => act(api.put(`/sessions/${s._id}/cancel`), 'Session cancelled')} className="btn btn-sm flex-1 bg-raised text-ink">Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-sm text-ink-3">No sessions yet.</p>}
              </div>
            </Card>
            <div className="space-y-4">
              <Card>
                <p className="font-medium text-ink">Rate a completed session</p>
                <select value={reviewForm.sessionId} onChange={(e) => setReviewForm({ ...reviewForm, sessionId: e.target.value })} className="input mt-2 px-2 py-2 text-xs">
                  <option value="">Select completed session…</option>
                  {done.map((s) => <option key={s._id} value={s._id}>{s.topic} · {s.date}</option>)}
                </select>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} className={`flex-1 rounded-lg py-2 text-lg ${reviewForm.rating >= n ? 'bg-amber-500/15 text-amber-600' : 'bg-raised text-ink-3'}`}>★</button>
                  ))}
                </div>
                <input value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="What was great?" className="input mt-2" />
                <button onClick={() => act(api.post('/reviews', reviewForm), 'Review submitted')} className="btn btn-primary mt-2 w-full">Submit review</button>
              </Card>
              <Card>
                <p className="font-medium text-ink">Report a user</p>
                <input value={reportForm.reportedUserId} onChange={(e) => setReportForm({ ...reportForm, reportedUserId: e.target.value })} placeholder="Paste reported user ID (from profile)" className="input mt-2 text-xs" />
                <select value={reportForm.reason} onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })} className="input mt-2 px-2 py-2 text-xs">
                  <option>Inappropriate behavior</option><option>Spam</option><option>No-show</option><option>Fake skills</option><option>Other</option>
                </select>
                <input value={reportForm.details} onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })} placeholder="Details" className="input mt-2 text-xs" />
                <button onClick={() => act(api.post('/reports', reportForm), 'Report submitted for admin review')} className="btn btn-secondary mt-2 w-full">Submit report</button>
              </Card>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="font-medium text-ink">Edit profile</p>
              <div className="mt-3 space-y-3 text-sm">
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" className="input" />
                <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Bio — what do you love teaching?" rows={3} className="input" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })} className="input px-2 py-2.5">
                    {['Flexible', 'Weekdays', 'Evenings', 'Weekends'].map((a) => <option key={a}>{a}</option>)}
                  </select>
                  <select value={profile.mode} onChange={(e) => setProfile({ ...profile, mode: e.target.value })} className="input px-2 py-2.5">
                    {['Both', 'Online', 'Offline'].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <button onClick={() => act(api.put('/users/profile', profile), 'Profile saved')} className="btn btn-primary w-full">Save profile</button>
                <p className="text-xs text-ink-3">Your ID (for reports): <code className="text-ink-2">{user?._id}</code></p>
              </div>
            </Card>
            <Card>
              <p className="font-medium text-ink">My skills</p>
              <div className="mt-3">
                <p className="label text-positive">Can teach</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(user?.teachSkills || []).map((s) => (
                    <button key={s.skillName} title="Click to remove" onClick={() => act(api.delete('/users/skills', { params: { skillName: s.skillName, type: 'teach' } }), `Removed ${s.skillName}`)}>
                      <SkillChip name={s.skillName} level={s.level} tone="teach" />
                    </button>
                  ))}
                  {(user?.teachSkills || []).length === 0 && <span className="text-xs text-ink-3">None yet</span>}
                </div>
                <p className="label mt-3 text-sky-700">Want to learn</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(user?.learnSkills || []).map((s) => (
                    <button key={s.skillName} title="Click to remove" onClick={() => act(api.delete('/users/skills', { params: { skillName: s.skillName, type: 'learn' } }), `Removed ${s.skillName}`)}>
                      <SkillChip name={s.skillName} level={s.level} tone="learn" />
                    </button>
                  ))}
                  {(user?.learnSkills || []).length === 0 && <span className="text-xs text-ink-3">None yet</span>}
                </div>
              </div>
              <div className="mt-4 border-t border-hairline pt-4">
                <p className="text-sm font-medium text-ink">Add a skill</p>
                <select value={skillForm.skillName} onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })} className="input mt-2">
                  <option value="">Choose from admin list…</option>
                  {skills.map((s) => <option key={s._id} value={s.name}>{s.name} ({s.category})</option>)}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })} className="input px-2 py-2.5 text-sm">
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <select value={skillForm.type} onChange={(e) => setSkillForm({ ...skillForm, type: e.target.value })} className="input px-2 py-2.5 text-sm">
                    <option value="teach">Can teach</option><option value="learn">Want to learn</option>
                  </select>
                </div>
                <button onClick={() => act(api.post('/users/skills', skillForm), 'Skill added')} className="btn btn-primary mt-2 w-full">Add skill</button>
                <p className="mt-2 text-xs text-ink-3">Click a chip to remove it. Missing a skill? Ask an admin to add it.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
