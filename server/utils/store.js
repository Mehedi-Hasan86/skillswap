// In-memory fallback store so the project runs without MongoDB.
// When MONGO_URI is configured the mongoose models are used instead;
// otherwise every route uses this store. Shape mirrors the mongoose schemas.
const crypto = require('crypto');

function id() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

const store = {
  users: [],
  skills: [],
  requests: [],
  sessions: [],
  reviews: [],
  reports: [],
  creditTx: [],
};

function safeUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

function seedIfEmpty() {
  if (store.skills.length > 0) return;
  const seedSkills = [
    ['JavaScript', 'Programming', 'Modern JS, ES6+, DOM and Node basics'],
    ['Python', 'Programming', 'Scripting, OOP and data handling'],
    ['UI Design', 'Design', 'Figma, layout, color and typography'],
    ['Graphic Design', 'Design', 'Posters, branding with Canva/Photoshop'],
    ['Public Speaking', 'Communication', 'Presentation and stage confidence'],
    ['English Writing', 'Communication', 'Essays, emails and reports'],
    ['Guitar', 'Music', 'Chords, rhythm and beginner songs'],
    ['Photography', 'Media', 'Composition, light and mobile editing'],
    ['Data Structures', 'Programming', 'Arrays, linked lists, trees, graphs'],
    ['Machine Learning', 'Programming', 'Intro ML with Python'],
    ['Video Editing', 'Media', 'CapCut / Premiere basics'],
    ['Cooking', 'Lifestyle', 'Everyday meals and budgeting'],
  ];
  seedSkills.forEach(([name, category, description]) => {
    store.skills.push({ _id: id(), name, category, description, createdAt: new Date().toISOString() });
  });
}

module.exports = { store, id, safeUser, seedIfEmpty };
