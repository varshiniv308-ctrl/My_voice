const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

// All meeting routes are protected
router.use(protect);

// GET /api/meetings — list with pagination/search/filters
router.get('/', getMeetings);

// GET /api/meetings/:id
router.get('/:id', getMeetingById);

// POST /api/meetings
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Meeting title is required.')
      .isLength({ max: 200 }).withMessage('Title must be 200 characters or fewer.'),
    body('participants')
      .optional()
      .isArray().withMessage('Participants must be an array of strings.'),
    body('duration')
      .optional()
      .isNumeric().withMessage('Duration must be a number (minutes).'),
    body('sentimentScore')
      .optional()
      .isFloat({ min: -1, max: 1 }).withMessage('Sentiment score must be between -1 and 1.'),
    body('keywords')
      .optional()
      .isArray().withMessage('Keywords must be an array of strings.'),
  ],
  validate,
  createMeeting
);

// PUT /api/meetings/:id
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Title cannot be empty.')
      .isLength({ max: 200 }).withMessage('Title must be 200 characters or fewer.'),
    body('participants')
      .optional()
      .isArray().withMessage('Participants must be an array of strings.'),
    body('duration')
      .optional()
      .isNumeric().withMessage('Duration must be a number (minutes).'),
    body('sentimentScore')
      .optional()
      .isFloat({ min: -1, max: 1 }).withMessage('Sentiment score must be between -1 and 1.'),
    body('keywords')
      .optional()
      .isArray().withMessage('Keywords must be an array of strings.'),
  ],
  validate,
  updateMeeting
);

// DELETE /api/meetings/:id
router.delete('/:id', deleteMeeting);

module.exports = router;
