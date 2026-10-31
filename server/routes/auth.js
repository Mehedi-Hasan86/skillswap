const express = require('express');
const bcrypt = require('bcryptjs');
const { dbConnected } = require('../config/db');
const User = require('../models/User');
const { store, id, safeUser, seedIfEmpty } = require('../utils/store');
const { signToken, authRequired } = require('../middleware/auth');
const { verifyIdToken } = require('../config/firebase');

const router = express.Router();
seedIfEmpty();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, availability, mode, bio } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });
    if (String(password).length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const emailNorm = String(email).toLowerCase().trim();

    if (dbConnected()) {
      const exists = await User.findOne({ email: emailNorm });
      if (exists) return res.status(400).json({ error: 'Email already registered' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: String(name).trim(),
        email: emailNorm,
        passwordHash,
        availability: availability || 'Flexible',
        mode: mode || 'Both',
        bio: bio || '',
      });
      const token = signToken(user);
      return res.status(201).json({ token, user: user.toSafeJSON() });
    }

    if (store.users.some((u) => u.email === emailNorm))
      return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      _id: id(),
      name: String(name).trim(),
      email: emailNorm,
      passwordHash,
      role: emailNorm === 'admin@skillswap.local' ? 'admin' : 'student',
      bio: bio || '',
      availability: availability || 'Flexible',
      mode: mode || 'Both',
      teachSkills: [],
      learnSkills: [],
      credits: 2,
      avgRating: 0,
      totalReviews: 0,
      badges: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    const token = signToken(user);
    return res.status(201).json({ token, user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const emailNorm = String(email).toLowerCase().trim();

    let user, hash;
    if (dbConnected()) {
      user = await User.findOne({ email: emailNorm });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      if (user.authProvider === 'google' && !user.passwordHash)
        return res.status(400).json({ error: 'This account uses Google sign-in — please continue with Google' });
      hash = user.passwordHash;
      const ok = await bcrypt.compare(password, hash);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
      if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
      const token = signToken(user);
      return res.json({ token, user: user.toSafeJSON() });
    }

    user = store.users.find((u) => u.email === emailNorm);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.authProvider === 'google' && !user.passwordHash)
      return res.status(400).json({ error: 'This account uses Google sign-in — please continue with Google' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/google { idToken } — Firebase Google Sign-In.
// Verifies the Firebase ID token, then finds-or-creates the SkillSwap
// user and returns our own JWT (used for all /api calls).
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    let decoded;
    try {
      decoded = await verifyIdToken(idToken);
    } catch (e) {
      const msg = /not configured/i.test(e.message)
        ? 'Google sign-in is not configured on the server (missing Firebase Admin credentials)'
        : 'Invalid Google token';
      const code = /not configured/i.test(e.message) ? 503 : 401;
      return res.status(code).json({ error: msg });
    }

    const emailNorm = String(decoded.email || '').toLowerCase().trim();
    if (!emailNorm || decoded.email_verified === false)
      return res.status(400).json({ error: 'Google account email not available/verified' });

    const name = decoded.name || emailNorm.split('@')[0];
    const avatar = decoded.picture || '';

    if (dbConnected()) {
      let user = (await User.findOne({ firebaseUid: decoded.uid })) || (await User.findOne({ email: emailNorm }));
      if (!user) {
        user = await User.create({
          name, email: emailNorm, firebaseUid: decoded.uid,
          authProvider: 'google', avatar, credits: 2,
        });
      } else {
        if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
        let touch = false;
        if (!user.firebaseUid) { user.firebaseUid = decoded.uid; touch = true; }
        if (user.authProvider !== 'google') { user.authProvider = 'google'; touch = true; }
        if (avatar && !user.avatar) { user.avatar = avatar; touch = true; }
        if (touch) await user.save();
      }
      if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
      return res.json({ token: signToken(user), user: user.toSafeJSON() });
    }

    // in-memory fallback
    let user = store.users.find((u) => u.firebaseUid === decoded.uid)
      || store.users.find((u) => u.email === emailNorm);
    if (!user) {
      user = {
        _id: id(), name, email: emailNorm, passwordHash: '',
        firebaseUid: decoded.uid, authProvider: 'google', avatar,
        role: 'student', bio: '', availability: 'Flexible', mode: 'Both',
        teachSkills: [], learnSkills: [], credits: 2,
        avgRating: 0, totalReviews: 0, badges: [], status: 'active',
        createdAt: new Date().toISOString(),
      };
      store.users.push(user);
    } else {
      if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
      if (!user.firebaseUid) user.firebaseUid = decoded.uid;
      user.authProvider = 'google';
      if (avatar && !user.avatar) user.avatar = avatar;
    }
    return res.json({ token: signToken(user), user: safeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: 'Google sign-in failed' });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  const { passwordHash, ...safe } = req.user;
  res.json({ user: safe });
});

module.exports = router;
