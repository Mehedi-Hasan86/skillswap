const express = require('express');
const { dbConnected } = require('../config/db');
const User = require('../models/User');
const { store, safeUser } = require('../utils/store');
const { authRequired } = require('../middleware/auth');
const { computeMatch } = require('../utils/match');

const router = express.Router();

function toPlain(u) {
  return u && u.toObject ? (() => { const o = u.toObject(); delete o.passwordHash; return o; })() : safeUser(u);
}

// GET /api/users/matches — ranked compatible partners with scores
router.get('/matches', authRequired, async (req, res) => {
  let me = req.user;
  let others;
  if (dbConnected()) {
    others = await User.find({ _id: { $ne: me._id }, status: 'active', role: 'student' }).limit(100);
    others = others.map((u) => u.toObject());
  } else {
    others = store.users.filter((u) => String(u._id) !== String(me._id) && u.status === 'active' && u.role !== 'admin');
  }
  const search = (req.query.search || '').toLowerCase();
  const results = others
    .map((o) => {
      const { passwordHash, ...safe } = o;
      const m = computeMatch(me, safe);
      return { user: safe, ...m };
    })
    .filter((r) => r.score > 0)
    .filter((r) => {
      if (!search) return true;
      const u = r.user;
      return (
        u.name.toLowerCase().includes(search) ||
        (u.teachSkills || []).some((s) => s.skillName.toLowerCase().includes(search)) ||
        (u.learnSkills || []).some((s) => s.skillName.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  res.json({ matches: results });
});

// PUT /api/users/profile
router.put('/profile', authRequired, async (req, res) => {
  const { name, bio, availability, mode } = req.body;
  if (dbConnected()) {
    const u = await User.findById(req.user._id);
    if (name) u.name = String(name).trim();
    if (bio !== undefined) u.bio = String(bio);
    if (availability) u.availability = availability;
    if (mode) u.mode = mode;
    await u.save();
    return res.json({ user: u.toSafeJSON() });
  }
  const u = store.users.find((x) => String(x._id) === String(req.user._id));
  if (name) u.name = String(name).trim();
  if (bio !== undefined) u.bio = String(bio);
  if (availability) u.availability = availability;
  if (mode) u.mode = mode;
  res.json({ user: safeUser(u) });
});

// POST /api/users/skills { skillName, level, type: teach|learn }
router.post('/skills', authRequired, async (req, res) => {
  const { skillName, level, type } = req.body;
  if (!skillName || !['teach', 'learn'].includes(type))
    return res.status(400).json({ error: 'skillName and type (teach|learn) required' });
  const lvl = ['Beginner', 'Intermediate', 'Advanced'].includes(level) ? level : 'Beginner';

  async function addTo(userObj, save) {
    const list = type === 'teach' ? userObj.teachSkills : userObj.learnSkills;
    const exists = list.some((s) => s.skillName.toLowerCase() === String(skillName).toLowerCase().trim());
    if (exists) return { dup: true };
    list.push({ skillName: String(skillName).trim(), level: lvl });
    await save();
    return { dup: false };
  }

  if (dbConnected()) {
    const u = await User.findById(req.user._id);
    const r = await addTo(u, () => u.save());
    if (r.dup) return res.status(400).json({ error: 'Skill already added' });
    return res.json({ user: u.toSafeJSON() });
  }
  const u = store.users.find((x) => String(x._id) === String(req.user._id));
  const r = await addTo(u, async () => {});
  if (r.dup) return res.status(400).json({ error: 'Skill already added' });
  res.json({ user: safeUser(u) });
});

// DELETE /api/users/skills?skillName=X&type=teach
router.delete('/skills', authRequired, async (req, res) => {
  const { skillName, type } = req.query;
  if (!skillName || !['teach', 'learn'].includes(type))
    return res.status(400).json({ error: 'skillName and type required' });
  const norm = String(skillName).toLowerCase().trim();
  if (dbConnected()) {
    const u = await User.findById(req.user._id);
    if (type === 'teach') u.teachSkills = u.teachSkills.filter((s) => s.skillName.toLowerCase() !== norm);
    else u.learnSkills = u.learnSkills.filter((s) => s.skillName.toLowerCase() !== norm);
    await u.save();
    return res.json({ user: u.toSafeJSON() });
  }
  const u = store.users.find((x) => String(x._id) === String(req.user._id));
  if (type === 'teach') u.teachSkills = u.teachSkills.filter((s) => s.skillName.toLowerCase() !== norm);
  else u.learnSkills = u.learnSkills.filter((s) => s.skillName.toLowerCase() !== norm);
  res.json({ user: safeUser(u) });
});

// GET /api/users/:id (public profile, no email/hash)
router.get('/:uid', authRequired, async (req, res) => {
  let u;
  if (dbConnected()) {
    u = await User.findById(req.params.uid);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const safe = u.toSafeJSON();
    delete safe.email;
    return res.json({ user: safe });
  }
  u = store.users.find((x) => String(x._id) === String(req.params.uid));
  if (!u) return res.status(404).json({ error: 'User not found' });
  const safe = safeUser(u);
  delete safe.email;
  // attach match score vs me
  const m = computeMatch(req.user, safe);
  res.json({ user: safe, match: m });
});

module.exports = router;
