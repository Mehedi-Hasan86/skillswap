const express = require('express');
const { dbConnected } = require('../config/db');
const Report = require('../models/Report');
const { store, id, safeUser } = require('../utils/store');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports { reportedUserId, reason, details }
router.post('/', authRequired, async (req, res) => {
  const { reportedUserId, reason, details } = req.body;
  if (!reportedUserId || !reason) return res.status(400).json({ error: 'reportedUserId and reason required' });
  if (dbConnected()) {
    const rep = await Report.create({ reporter: req.user._id, reportedUser: reportedUserId, reason, details: details || '' });
    return res.status(201).json({ report: rep });
  }
  const rep = { _id: id(), reporter: String(req.user._id), reportedUser: String(reportedUserId), reason, details: details || '', status: 'pending', actionTaken: '', createdAt: new Date().toISOString() };
  store.reports.push(rep);
  res.status(201).json({ report: rep });
});

// GET /api/reports (admin)
router.get('/', authRequired, adminOnly, async (req, res) => {
  if (dbConnected()) {
    const list = await Report.find().populate('reporter reportedUser').sort({ createdAt: -1 });
    return res.json({ reports: list });
  }
  const list = [...store.reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((r) => ({
    ...r,
    reporter: (() => { const u = store.users.find((x) => String(x._id) === String(r.reporter)); return u ? safeUser(u) : r.reporter; })(),
    reportedUser: (() => { const u = store.users.find((x) => String(x._id) === String(r.reportedUser)); return u ? safeUser(u) : r.reportedUser; })(),
  }));
  res.json({ reports: list });
});

// PUT /api/reports/:id { status, actionTaken }
router.put('/:rid', authRequired, adminOnly, async (req, res) => {
  const { status, actionTaken } = req.body;
  if (dbConnected()) {
    const r = await Report.findById(req.params.rid);
    if (!r) return res.status(404).json({ error: 'Report not found' });
    if (status) r.status = status;
    if (actionTaken !== undefined) r.actionTaken = actionTaken;
    await r.save();
    return res.json({ report: r });
  }
  const r = store.reports.find((x) => String(x._id) === String(req.params.rid));
  if (!r) return res.status(404).json({ error: 'Report not found' });
  if (status) r.status = status;
  if (actionTaken !== undefined) r.actionTaken = actionTaken;
  res.json({ report: r });
});

module.exports = router;
