const express = require('express');
const router = express.Router();
const {
  getLiveTranscript,
  getTranscriptSummary,
} = require('../controllers/transcriptController');
const { protect } = require('../middleware/authMiddleware');

// All transcript routes are protected
router.use(protect);

// GET /api/transcript/live
router.get('/live', getLiveTranscript);

// GET /api/transcript/summary
router.get('/summary', getTranscriptSummary);

module.exports = router;
