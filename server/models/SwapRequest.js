const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teachSkill: { type: String, required: true }, // what sender offers to teach
    learnSkill: { type: String, required: true }, // what sender wants to learn
    message: { type: String, default: '' },
    matchScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SwapRequest || mongoose.model('SwapRequest', swapRequestSchema);
