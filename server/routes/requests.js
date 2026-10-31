const express = require('express');
const { dbConnected } = require('../config/db');
const SwapRequest = require('../models/SwapRequest');
const { store, id, safeUser } = require('../utils/store');
const { authRequired } = require('../middleware/auth');
const { computeMatch } = require('../utils/match');

const router = express.Router();

function populate(r, users) {
  const from = users.find((u) => String(u._id) === String(r.fromUser || r.fromUser?._id));
  const to = users.find((u) => String(u._id) === String(r.toUser || r.toUser?._id));
  return { ...r, fromUser: from ? safeUser(from) : r.fromUser, toUser: to ? safeUser(to) : r.toUser };
}

// GET /api/requests?box=incoming|outgoing|all
router.get('/', authRequired, async (req, res) => {
  const box = req.query.box || 'all';
  const me = String(req.user._id);
  if (dbConnected()) {
    let q = {};
    if (box === 'incoming') q = { toUser: me };
    else if (box === 'outgoing') q = { fromUser: me };
    else q = { $or: [{ fromUser: me }, { toUser: me }] };
    const reqs = await SwapRequest.find(q).populate('fromUser toUser').sort({ createdAt: -1 });
    return res.json({ requests: reqs });
  }
  let list = store.requests.filter((r) => String(r.fromUser) === me || String(r.toUser) === me);
  if (box === 'incoming') list = list.filter((r) => String(r.toUser) === me);
  if (box === 'outgoing') list = list.filter((r) => String(r.fromUser) === me);
  list = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r) => populate({ ...r }, store.users));
  res.json({ requests: list });
});

// POST /api/requests { toUserId, teachSkill, learnSkill, message }
router.post('/', authRequired, async (req, res) => {
  const { toUserId, teachSkill, learnSkill, message } = req.body;
  if (!toUserId || !teachSkill || !learnSkill)
    return res.status(400).json({ error: 'toUserId, teachSkill and learnSkill required' });
  if (String(toUserId) === String(req.user._id))
    return res.status(400).json({ error: 'Cannot send request to yourself' });

  // credit check: sender must have >= 1 credit unless perfect two-way match
  const other = dbConnected()
    ? await require('../models/User').findById(toUserId)
    : store.users.find((u) => String(u._id) === String(toUserId));
  if (!other) return res.status(404).json({ error: 'Partner not found' });
  const otherPlain = other.toObject ? (() => { const o = other.toObject(); delete o.passwordHash; return o; })() : safeUser(other);
  const m = computeMatch(req.user, otherPlain);

  const senderCredits = req.user.credits ?? 0;
  if (!m.perfect && senderCredits < 1)
    return res.status(400).json({ error: 'Not enough Skill Credits (need 1). Teach a session to earn more.' });

  if (dbConnected()) {
    const dup = await SwapRequest.findOne({ fromUser: req.user._id, toUser: toUserId, status: 'pending' });
    if (dup) return res.status(400).json({ error: 'Pending request already exists' });
    const r = await SwapRequest.create({
      fromUser: req.user._id, toUser: toUserId, teachSkill, learnSkill,
      message: message || '', matchScore: m.score,
    });
    await r.populate('fromUser toUser');
    // spend 1 credit for non-perfect match at request time? No — spend on completion.
    return res.status(201).json({ request: r });
  }

  if (store.requests.some((r) => String(r.fromUser) === String(req.user._id) && String(r.toUser) === String(toUserId) && r.status === 'pending'))
    return res.status(400).json({ error: 'Pending request already exists' });
  const r = {
    _id: id(), fromUser: String(req.user._id), toUser: String(toUserId),
    teachSkill, learnSkill, message: message || '', matchScore: m.score,
    status: 'pending', createdAt: new Date().toISOString(),
  };
  store.requests.push(r);
  res.status(201).json({ request: populate({ ...r }, store.users) });
});

// PUT /api/requests/:id/:action accept|reject|cancel
router.put('/:reqId/:action', authRequired, async (req, res) => {
  const { reqId, action } = req.params;
  if (!['accept', 'reject', 'cancel'].includes(action))
    return res.status(400).json({ error: 'Invalid action' });
  const me = String(req.user._id);

  async function apply(r, save) {
    if (!r) return { code: 404, error: 'Request not found' };
    const from = String(r.fromUser?._id || r.fromUser);
    const to = String(r.toUser?._id || r.toUser);
    if (action === 'accept' || action === 'reject') {
      if (to !== me) return { code: 403, error: 'Only the receiver can do this' };
      if (r.status !== 'pending') return { code: 400, error: `Already ${r.status}` };
      r.status = action === 'accept' ? 'accepted' : 'rejected';
    } else {
      if (from !== me && to !== me) return { code: 403, error: 'Not your request' };
      if (r.status !== 'pending') return { code: 400, error: `Already ${r.status}` };
      r.status = 'cancelled';
    }
    await save();
    return { code: 200, r };
  }

  if (dbConnected()) {
    const r = await SwapRequest.findById(reqId);
    const out = await apply(r, () => r && r.save());
    if (out.code !== 200) return res.status(out.code).json({ error: out.error });
    await out.r.populate('fromUser toUser');
    return res.json({ request: out.r });
  }
  const r = store.requests.find((x) => String(x._id) === String(reqId));
  const out = await apply(r, async () => {});
  if (out.code !== 200) return res.status(out.code).json({ error: out.error });
  res.json({ request: populate({ ...out.r }, store.users) });
});

module.exports = router;
