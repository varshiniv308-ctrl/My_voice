const Settings = require('../models/Settings');

/**
 * @desc    Get settings for the authenticated user
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
  try {
    // Find or auto-create settings for this user
    let settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = await Settings.create({ userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Settings fetched successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update settings for the authenticated user
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = async (req, res, next) => {
  try {
    const {
      encryptionTier,
      aiModel,
      voiceTone,
      integrations,
      webhookUrl,
      themeMode,
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (encryptionTier !== undefined) updateData.encryptionTier = encryptionTier;
    if (aiModel !== undefined) updateData.aiModel = aiModel;
    if (voiceTone !== undefined) updateData.voiceTone = voiceTone;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
    if (themeMode !== undefined) updateData.themeMode = themeMode;

    // Deep merge integrations if provided
    if (integrations !== undefined) {
      if (typeof integrations !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Integrations must be an object.',
        });
      }
      // Only allow known integration keys
      const allowed = ['slack', 'github', 'notion'];
      allowed.forEach((key) => {
        if (integrations[key] !== undefined) {
          updateData[`integrations.${key}`] = Boolean(integrations[key]);
        }
      });
    }

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
