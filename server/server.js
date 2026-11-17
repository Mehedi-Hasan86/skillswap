const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, dbConnected } = require('./config/db');
const { store, id, seedIfEmpty } = require('./utils/store');
const { seedMemory } = require('./seed');

const app = express();
// Accept localhost and 127.0.0.1 (Vite binds to all interfaces) and any
// origin during local development, so a CORS mismatch never looks like a
// "Network Error" during Google sign-in.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((o) => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
  },
}));
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

// Initialization runs once per process (local dev or a warm serverless
// instance). Exporting `ready` lets the Vercel function await it.
const ready = (async () => {
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
})();

// Only start a HTTP listener when run directly (npm run dev / npm start).
// On Vercel the app is imported by api/index.js as a serverless function.
if (require.main === module) {
  ready.then(() => app.listen(PORT, () => console.log(`SkillSwap server running on ${PORT} [${dbConnected() ? 'mongodb' : 'in-memory'}]`)));
}

app.ready = ready;
module.exports = app;
