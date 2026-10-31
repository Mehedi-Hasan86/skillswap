const express = require('express');
const { dbConnected } = require('../config/db');
const User = require('../models/User');
const { store } = require('../utils/store');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/credits/balance
router.get('/balance', authRequired, async (req, res) => {
  if (dbConnected()) {
    const u = await User.findById(req.user._id);
    return res.json({ credits: u.credits ?? 0 });
  }
  const u = store.users.find((x) => String(x._id) === String(req.user._id));
  const tx = store.creditTx.filter((t) => String(t.userId) === String(req.user._id)).slice(-20).reverse();
  res.json({ credits: u ? u.credits ?? 0 : 0, history: tx });
});

module.exports = router;
