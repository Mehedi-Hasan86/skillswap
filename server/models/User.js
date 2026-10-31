const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema(
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    skillName: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    firebaseUid: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    bio: { type: String, default: '' },
    availability: { type: String, default: 'Flexible' },
    mode: { type: String, enum: ['Online', 'Offline', 'Both'], default: 'Both' },
    teachSkills: { type: [userSkillSchema], default: [] },
    learnSkills: { type: [userSkillSchema], default: [] },
    credits: { type: Number, default: 2, min: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  const o = this.toObject();
  delete o.passwordHash;
  return o;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
