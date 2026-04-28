const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

// All settings routes are protected
router.use(protect);

// GET /api/settings
router.get('/', getSettings);

// PUT /api/settings
router.put(
  '/',
  [
    body('encryptionTier')
      .optional()
      .isIn(['standard', 'advanced', 'quantum'])
      .withMessage('encryptionTier must be one of: standard, advanced, quantum.'),
    body('aiModel')
      .optional()
      .isIn(['cognitive-lite', 'cognitive-pro', 'cognitive-ultra'])
      .withMessage('aiModel must be one of: cognitive-lite, cognitive-pro, cognitive-ultra.'),
    body('voiceTone')
      .optional()
      .isIn(['formal', 'neutral', 'conversational'])
      .withMessage('voiceTone must be one of: formal, neutral, conversational.'),
    body('themeMode')
      .optional()
      .isIn(['light', 'dark', 'system'])
      .withMessage('themeMode must be one of: light, dark, system.'),
    body('webhookUrl')
      .optional()
      .custom((value) => {
        if (value === '') return true; // Allow empty string to clear webhook
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) throw new Error('webhookUrl must be a valid HTTP/S URL.');
        return true;
      }),
    body('integrations')
      .optional()
      .isObject().withMessage('integrations must be an object.'),
    body('integrations.slack')
      .optional()
      .isBoolean().withMessage('integrations.slack must be a boolean.'),
    body('integrations.github')
      .optional()
      .isBoolean().withMessage('integrations.github must be a boolean.'),
    body('integrations.notion')
      .optional()
      .isBoolean().withMessage('integrations.notion must be a boolean.'),
  ],
  validate,
  updateSettings
);

module.exports = router;
