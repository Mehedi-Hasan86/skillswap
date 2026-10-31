const express = require('express');
const { dbConnected } = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Session = require('../models/Session');
const Report = require('../models/Report');
const { store, safeUser } = require('../utils/store');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  if (dbConnected()) {
    const [totalUsers, pendingRequests, activeSwaps, completedSessions, pendingReports, skills] = await Promise.all([
      User.countDocuments(), SwapRequest.countDocuments({ status: 'pending' }),
      SwapRequest.countDocuments({ status: 'accepted' }), Session.countDocuments({ status: 'Completed' }),
      Report.countDocuments({ status: 'pending' }), Skill.find(),
    ]);
    const popular = await SwapRequest.aggregate([
      { $group: { _id: '$learnSkill', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 },
    ]);
    return res.json({
      stats: { totalUsers, pendingRequests, activeSwaps, completedSessions, pendingReports, totalSkills: skills.length, popularSkills: popular },
    });
  }
  const countBy = {};
  [...store.requests, ...store.sessions].forEach(() => {});
  store.requests.forEach((r) => { countBy[r.learnSkill] = (countBy[r.learnSkill] || 0) + 1; });
  const popular = Object.entries(countBy).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ _id: name, count }));
  // fallback: top teach skills
  if (popular.length === 0) {
    const tc = {};
    store.users.forEach((u) => (u.teachSkills || []).forEach((s) => { tc[s.skillName] = (tc[s.skillName] || 0) + 1; }));
    Object.entries(tc).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([name, count]) => popular.push({ _id: name, count }));
  }
  res.json({
    stats: {
      totalUsers: store.users.length,
      pendingRequests: store.requests.filter((r) => r.status === 'pending').length,
      activeSwaps: store.requests.filter((r) => r.status === 'accepted').length,
      completedSessions: store.sessions.filter((s) => s.status === 'Completed').length,
      pendingReports: store.reports.filter((r) => r.status === 'pending').length,
      totalSkills: store.skills.length,
      totalSessions: store.sessions.length,
      popularSkills: popular,
    },
  });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  if (dbConnected()) {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ users: users.map((u) => u.toSafeJSON()) });
  }
  res.json({ users: [...store.users].reverse().map(safeUser) });
});

// PUT /api/admin/users/:uid { status: active|suspended }
router.put('/users/:uid', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (dbConnected()) {
    const u = await User.findByIdAndUpdate(req.params.uid, { status }, { new: true });
    if (!u) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: u.toSafeJSON() });
  }
  const u = store.users.find((x) => String(x._id) === String(req.params.uid));
  if (!u) return res.status(404).json({ error: 'User not found' });
  u.status = status;
  res.json({ user: safeUser(u) });
});

// GET /api/admin/credits — balances overview
router.get('/credits', async (req, res) => {
  const list = dbConnected()
    ? (await User.find().select('name email credits')).map((u) => u.toObject())
    : store.users.map((u) => ({ _id: u._id, name: u.name, email: u.email, credits: u.credits }));
  res.json({ balances: list, transactions: store.creditTx.slice(-50).reverse() });
});

module.exports = router;
