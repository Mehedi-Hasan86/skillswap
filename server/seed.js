// Seeds a demo admin + students (in-memory mode) so evaluators can log in instantly.
// In Mongo mode it upserts the same accounts.
const bcrypt = require('bcryptjs');

async function seedMemory(store, id) {
  if (store.users.length > 0) return;
  const studentHash = await bcrypt.hash('student123', 8);
  const adminHash = await bcrypt.hash('admin123', 8);
  const mk = (name, email, passwordHash, role, teach, learn, extra = {}) => {
    store.users.push({
      _id: id(), name, email, passwordHash, role,
      bio: extra.bio || '', availability: extra.availability || 'Flexible', mode: extra.mode || 'Both',
      teachSkills: teach, learnSkills: learn,
      credits: extra.credits ?? 3, avgRating: extra.avgRating ?? 0, totalReviews: extra.totalReviews ?? 0,
      badges: extra.badges ?? [], status: 'active', createdAt: new Date().toISOString(),
    });
  };
  mk('Admin', 'admin@skillswap.local', adminHash, 'admin', [], [], { bio: 'Platform administrator' });
  mk('Rahim Uddin', 'rahim@student.local', studentHash, 'student',
    [{ skillName: 'JavaScript', level: 'Advanced' }, { skillName: 'Python', level: 'Intermediate' }],
    [{ skillName: 'UI Design', level: 'Beginner' }, { skillName: 'Public Speaking', level: 'Beginner' }],
    { bio: 'CS junior who loves teaching JS.', availability: 'Evenings', mode: 'Online', avgRating: 4.8, totalReviews: 6, badges: ['Helpful Mentor', 'Reliable Partner'], credits: 5 });
  mk('Nusrat Jahan', 'nusrat@student.local', studentHash, 'student',
    [{ skillName: 'UI Design', level: 'Advanced' }, { skillName: 'Graphic Design', level: 'Intermediate' }],
    [{ skillName: 'JavaScript', level: 'Beginner' }, { skillName: 'Python', level: 'Beginner' }],
    { bio: 'Design student, Figma enthusiast.', availability: 'Evenings', mode: 'Online', avgRating: 4.9, totalReviews: 8, badges: ['Helpful Mentor'], credits: 4 });
  mk('Tanvir Hasan', 'tanvir@student.local', studentHash, 'student',
    [{ skillName: 'Guitar', level: 'Intermediate' }, { skillName: 'Photography', level: 'Advanced' }],
    [{ skillName: 'Machine Learning', level: 'Beginner' }],
    { bio: 'Photographer & guitarist.', availability: 'Weekends', mode: 'Both', avgRating: 4.6, totalReviews: 4, credits: 2 });
  mk('Mim Akter', 'mim@student.local', studentHash, 'student',
    [{ skillName: 'Public Speaking', level: 'Advanced' }, { skillName: 'English Writing', level: 'Intermediate' }],
    [{ skillName: 'Video Editing', level: 'Beginner' }, { skillName: 'Guitar', level: 'Beginner' }],
    { bio: 'Debater who can fix stage fear.', availability: 'Weekdays', mode: 'Offline', credits: 3 });
}

module.exports = { seedMemory };
