const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, dbConnected } = require('./config/db');
const { store, id, seedIfEmpty } = require('./utils/store');
const { seedMemory } = require('./seed');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || true }));
app.use(express.json());

// public
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is Running', team: 'CodeXchange', mode: dbConnected() ? 'mongodb' : 'in-memory', time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/users', require('./routes/users'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/admin', require('./routes/admin'));

// 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 5001;

(async () => {
  seedIfEmpty();
  await seedMemory(store, id);
  await connectDB();
  // if mongo connected, ensure skills exist there too (best-effort)
  if (dbConnected()) {
    try {
      const Skill = require('./models/Skill');
      const count = await Skill.countDocuments();
      if (count === 0) {
        await Skill.insertMany(store.skills.map((s) => ({ name: s.name, category: s.category, description: s.description })));
        console.log('Seeded skills to MongoDB');
      }
      const User = require('./models/User');
      const adminExists = await User.findOne({ email: 'admin@skillswap.local' });
      if (!adminExists) {
        const bcrypt = require('bcryptjs');
        await User.create({
          name: 'Admin', email: 'admin@skillswap.local',
          passwordHash: await bcrypt.hash('admin123', 10), role: 'admin', credits: 100,
        });
        console.log('Seeded admin to MongoDB (admin@skillswap.local / admin123)');
      }
    } catch (e) {
      console.warn('Mongo seed skipped:', e.message);
    }
  } else {
    console.log('Demo logins — admin@skillswap.local / admin123, rahim@student.local / student123');
  }
  app.listen(PORT, () => console.log(`SkillSwap server running on ${PORT} [${dbConnected() ? 'mongodb' : 'in-memory'}]`));
})();
