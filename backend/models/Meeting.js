const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    participants: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
    },
    transcript: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    keywords: {
      type: [String],
      default: [],
    },
    project: {
      type: String,
      trim: true,
      default: 'General',
    },
  },
  { timestamps: true }
);

// Text index for full-text search on title and transcript
MeetingSchema.index({ title: 'text', transcript: 'text' });

module.exports = mongoose.model('Meeting', MeetingSchema);
