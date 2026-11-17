const jwt = require('jsonwebtoken');
const { dbConnected } = require('../config/db');
const User = require('../models/User');
const { store, safeUser } = require('../utils/store');

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap-dev-secret-change-in-production';

function signToken(user) {
  const plain = user.toObject ? user.toObject() : user;
  const { passwordHash, ...snapshot } = plain;
  // Embed a signed user snapshot so authentication is stateless. On Vercel,
  // each serverless instance has its own in-memory store; a token issued by
  // one instance must still restore the session on any other instance.
  return jwt.sign(
    { id: user._id || user.id, role: user.role, snapshot },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function findUserById(uid) {
  if (dbConnected()) {
    const u = await User.findById(uid);
    return u;
  }
  return store.users.find((u) => String(u._id) === String(uid)) || null;
}

async function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    let user = await findUserById(payload.id);
    if (!user && payload.snapshot) {
      // Different Vercel lambda instance (or process restart) — fall back to
      // the signed snapshot and rehydrate it locally so the session survives.
      user = { ...payload.snapshot, _id: payload.snapshot._id || payload.id };
      if (!dbConnected() && !store.users.some((u) => String(u._id) === String(user._id))) {
        store.users.push({ ...user, passwordHash: '' });
      }
    }
    if (!user) return res.status(401).json({ error: 'User not found' });
    const plain = user.toObject ? user.toObject() : user;
    if (plain.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
    req.user = plain;
    req.userDoc = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin only' });
}

module.exports = { signToken, authRequired, adminOnly, findUserById, JWT_SECRET };
