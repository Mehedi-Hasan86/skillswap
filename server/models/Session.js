const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    topic: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:MM
    durationMins: { type: Number, default: 60 },
    mode: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
    location: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);
