const express = require('express');
const { dbConnected } = require('../config/db');
const Session = require('../models/Session');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const { store, id, safeUser } = require('../utils/store');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function withUsers(s) {
  const parts = (s.participants || []).map((pid) => {
    const u = store.users.find((x) => String(x._id) === String(pid?._id || pid));
    return u ? safeUser(u) : pid;
  });
  return { ...s, participants: parts };
}

// GET /api/sessions
router.get('/', authRequired, async (req, res) => {
  const me = String(req.user._id);
  if (dbConnected()) {
    const list = await Session.find({ participants: me }).sort({ date: 1 }).populate('participants request');
    return res.json({ sessions: list });
  }
  const list = store.sessions
    .filter((s) => (s.participants || []).map(String).includes(me))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map(withUsers);
  res.json({ sessions: list });
});

// POST /api/sessions { requestId, date, time, durationMins, mode, location }
router.post('/', authRequired, async (req, res) => {
  const { requestId, date, time, durationMins, mode, location } = req.body;
  if (!requestId || !date || !time) return res.status(400).json({ error: 'requestId, date, time required' });
  const me = String(req.user._id);

  if (dbConnected()) {
    const r = await SwapRequest.findById(requestId);
    if (!r) return res.status(404).json({ error: 'Request not found' });
    if (r.status !== 'accepted') return res.status(400).json({ error: 'Request must be accepted first' });
    const parts = [String(r.fromUser), String(r.toUser)];
    if (!parts.includes(me)) return res.status(403).json({ error: 'Not your exchange' });
    const s = await Session.create({
      request: r._id, participants: [r.fromUser, r.toUser],
      topic: `${r.teachSkill} ⇄ ${r.learnSkill}`,
      date, time, durationMins: durationMins || 60, mode: mode || 'Online', location: location || '',
    });
    await s.populate('participants request');
    return res.status(201).json({ session: s });
  }

  const r = store.requests.find((x) => String(x._id) === String(requestId));
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.status !== 'accepted') return res.status(400).json({ error: 'Request must be accepted first' });
  if (![String(r.fromUser), String(r.toUser)].includes(me))
    return res.status(403).json({ error: 'Not your exchange' });
  const s = {
    _id: id(), request: r._id, participants: [String(r.fromUser), String(r.toUser)],
    topic: `${r.teachSkill} ⇄ ${r.learnSkill}`,
    date, time, durationMins: durationMins || 60, mode: mode || 'Online', location: location || '',
    status: 'Scheduled', createdAt: new Date().toISOString(),
  };
  store.sessions.push(s);
  res.status(201).json({ session: withUsers(s) });
});

// PUT /api/sessions/:id/complete | /cancel
router.put('/:sid/:action', authRequired, async (req, res) => {
  const { sid, action } = req.params;
  if (!['complete', 'cancel'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
  const me = String(req.user._id);

  async function awardCredits(sessionObj) {
    // Teacher earns +1 credit; if non-perfect match, learner spends 1 (never below 0).
    const reqRef = dbConnected()
      ? await SwapRequest.findById(sessionObj.request)
      : store.requests.find((x) => String(x._id) === String(sessionObj.request));
    if (!reqRef) return;
    const teacherName = reqRef.teachSkill; // sender teaches this
    const fromId = String(reqRef.fromUser?._id || reqRef.fromUser);
    // sender is the teacher of `teachSkill`
    const teacherId = fromId;
    const learnerId = String(reqRef.toUser?._id || reqRef.toUser) === teacherId
      ? String(reqRef.toUser?._id || reqRef.toUser) : String(reqRef.toUser?._id || reqRef.toUser);

    async function addCredit(uid, delta, reason) {
      if (dbConnected()) {
        const u = await User.findById(uid);
        if (!u) return;
        u.credits = Math.max(0, (u.credits || 0) + delta);
        await u.save();
        return;
      }
      const u = store.users.find((x) => String(x._id) === String(uid));
      if (!u) return;
      u.credits = Math.max(0, (u.credits || 0) + delta);
      store.creditTx.push({ _id: id(), userId: String(uid), delta, reason, at: new Date().toISOString() });
    }
    await addCredit(teacherId, +1, `Taught ${teacherName}`);
    // learner spends only if they had >0 (credits never negative)
    const learner = dbConnected() ? await User.findById(learnerId) : store.users.find((x) => String(x._id) === String(learnerId));
    const bal = learner ? (learner.credits ?? 0) : 0;
    if (bal > 0) await addCredit(learnerId, -1, `Learned ${teacherName}`);
    void teacherName;
  }

  if (dbConnected()) {
    const s = await Session.findById(sid);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    if (!s.participants.map(String).includes(me)) return res.status(403).json({ error: 'Not your session' });
    if (s.status !== 'Scheduled') return res.status(400).json({ error: `Already ${s.status}` });
    s.status = action === 'complete' ? 'Completed' : 'Cancelled';
    await s.save();
    if (action === 'complete') await awardCredits(s);
    await s.populate('participants request');
    return res.json({ session: s });
  }

  const s = store.sessions.find((x) => String(x._id) === String(sid));
  if (!s) return res.status(404).json({ error: 'Session not found' });
  if (!(s.participants || []).map(String).includes(me)) return res.status(403).json({ error: 'Not your session' });
  if (s.status !== 'Scheduled') return res.status(400).json({ error: `Already ${s.status}` });
  s.status = action === 'complete' ? 'Completed' : 'Cancelled';
  if (action === 'complete') await awardCredits(s);
  res.json({ session: withUsers(s) });
});

module.exports = router;
