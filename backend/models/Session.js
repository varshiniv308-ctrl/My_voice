const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['live', 'paused', 'archived', 'terminated'],
      default: 'live',
    },
    latency: {
      type: Number, // Latency in milliseconds
      default: 0,
    },
    tokenEfficiency: {
      type: Number, // Percentage 0–100
      min: 0,
      max: 100,
      default: 99,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);
