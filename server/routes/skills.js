const express = require('express');
const { dbConnected } = require('../config/db');
const Skill = require('../models/Skill');
const { store, id, seedIfEmpty } = require('../utils/store');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();
seedIfEmpty();

// GET /api/skills
router.get('/', async (req, res) => {
  if (dbConnected()) {
    const skills = await Skill.find().sort({ name: 1 });
    return res.json({ skills });
  }
  return res.json({ skills: [...store.skills].sort((a, b) => a.name.localeCompare(b.name)) });
});

// POST /api/skills (admin)
router.post('/', authRequired, adminOnly, async (req, res) => {
  const { name, category, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name required' });
  if (dbConnected()) {
    try {
      const s = await Skill.create({ name: String(name).trim(), category: category || 'General', description: description || '' });
      return res.status(201).json({ skill: s });
    } catch (e) {
      return res.status(400).json({ error: 'Skill already exists' });
    }
  }
  if (store.skills.some((s) => s.name.toLowerCase() === String(name).toLowerCase().trim()))
    return res.status(400).json({ error: 'Skill already exists' });
  const skill = { _id: id(), name: String(name).trim(), category: category || 'General', description: description || '', createdAt: new Date().toISOString() };
  store.skills.push(skill);
  return res.status(201).json({ skill });
});

// PUT /api/skills/:id (admin)
router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const { name, category, description } = req.body;
  if (dbConnected()) {
    const s = await Skill.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(category && { category }), ...(description !== undefined && { description }) },
      { new: true }
    );
    if (!s) return res.status(404).json({ error: 'Skill not found' });
    return res.json({ skill: s });
  }
  const s = store.skills.find((x) => String(x._id) === String(req.params.id));
  if (!s) return res.status(404).json({ error: 'Skill not found' });
  if (name) s.name = name;
  if (category) s.category = category;
  if (description !== undefined) s.description = description;
  return res.json({ skill: s });
});

// DELETE /api/skills/:id (admin)
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  if (dbConnected()) {
    await Skill.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  }
  store.skills = store.skills.filter((x) => String(x._id) !== String(req.params.id));
  return res.json({ ok: true });
});

module.exports = router;
