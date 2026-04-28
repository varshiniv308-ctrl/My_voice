const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One settings document per user
    },
    encryptionTier: {
      type: String,
      enum: ['standard', 'advanced', 'quantum'],
      default: 'standard',
    },
    aiModel: {
      type: String,
      enum: ['cognitive-lite', 'cognitive-pro', 'cognitive-ultra'],
      default: 'cognitive-pro',
    },
    voiceTone: {
      type: String,
      enum: ['formal', 'neutral', 'conversational'],
      default: 'neutral',
    },
    integrations: {
      slack: { type: Boolean, default: false },
      github: { type: Boolean, default: false },
      notion: { type: Boolean, default: false },
    },
    webhookUrl: {
      type: String,
      default: '',
      trim: true,
    },
    themeMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
