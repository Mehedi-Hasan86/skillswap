const express = require('express');
const { dbConnected } = require('../config/db');
const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const { store, id, safeUser } = require('../utils/store');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function badgesFor(user, sessionsTaught, sessionsLearned, avg) {
  const b = new Set(user.badges || []);
  if ((avg || 0) >= 4.5 && (user.totalReviews || 0) >= 3) b.add('Helpful Mentor');
  if (sessionsLearned >= 3) b.add('Active Learner');
  if (sessionsTaught + sessionsLearned >= 5) b.add('Reliable Partner');
  return [...b];
}

// POST /api/reviews { sessionId, rating, comment }
router.post('/', authRequired, async (req, res) => {
  const { sessionId, rating, comment } = req.body;
  const r = Number(rating);
  if (!sessionId || !(r >= 1 && r <= 5)) return res.status(400).json({ error: 'sessionId and rating 1-5 required' });
  const me = String(req.user._id);

  if (dbConnected()) {
    const s = await Session.findById(sessionId);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    if (s.status !== 'Completed') return res.status(400).json({ error: 'Can only review completed sessions' });
    if (!s.participants.map(String).includes(me)) return res.status(403).json({ error: 'Not your session' });
    const toId = s.participants.map(String).find((p) => p !== me);
    const dup = await Review.findOne({ session: sessionId, fromUser: me });
    if (dup) return res.status(400).json({ error: 'Already reviewed' });
    const rev = await Review.create({ session: sessionId, fromUser: me, toUser: toId, rating: r, comment: comment || '' });
    // update avg
    const all = await Review.find({ toUser: toId });
    const avg = all.reduce((a, x) => a + x.rating, 0) / all.length;
    const u = await User.findById(toId);
    u.avgRating = Math.round(avg * 10) / 10;
    u.totalReviews = all.length;
    u.badges = badgesFor(u, all.length, u.totalReviews, avg);
    await u.save();
    return res.status(201).json({ review: rev });
  }

  const s = store.sessions.find((x) => String(x._id) === String(sessionId));
  if (!s) return res.status(404).json({ error: 'Session not found' });
  if (s.status !== 'Completed') return res.status(400).json({ error: 'Can only review completed sessions' });
  if (!(s.participants || []).map(String).includes(me)) return res.status(403).json({ error: 'Not your session' });
  const toId = (s.participants || []).map(String).find((p) => p !== me);
  if (store.reviews.some((x) => String(x.session) === String(sessionId) && String(x.fromUser) === me))
    return res.status(400).json({ error: 'Already reviewed' });
  const rev = { _id: id(), session: String(sessionId), fromUser: me, toUser: toId, rating: r, comment: comment || '', createdAt: new Date().toISOString() };
  store.reviews.push(rev);
  const all = store.reviews.filter((x) => String(x.toUser) === String(toId));
  const avg = all.reduce((a, x) => a + x.rating, 0) / all.length;
  const u = store.users.find((x) => String(x._id) === String(toId));
  if (u) {
    u.avgRating = Math.round(avg * 10) / 10;
    u.totalReviews = all.length;
    u.badges = badgesFor(u, all.length, all.length, avg);
  }
  res.status(201).json({ review: rev });
});

// GET /api/reviews/user/:uid
router.get('/user/:uid', authRequired, async (req, res) => {
  if (dbConnected()) {
    const list = await Review.find({ toUser: req.params.uid }).populate('fromUser session').sort({ createdAt: -1 });
    return res.json({ reviews: list });
  }
  const list = store.reviews
    .filter((x) => String(x.toUser) === String(req.params.uid))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((rv) => ({
      ...rv,
      fromUser: (() => { const u = store.users.find((x) => String(x._id) === String(rv.fromUser)); return u ? safeUser(u) : rv.fromUser; })(),
    }));
  res.json({ reviews: list });
});

module.exports = router;
