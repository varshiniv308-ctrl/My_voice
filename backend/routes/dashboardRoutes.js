const express = require('express');
const router = express.Router();
const {
  getStats,
  getConversations,
  startSession,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All dashboard routes are protected
router.use(protect);

// GET /api/dashboard/stats
router.get('/stats', getStats);

// GET /api/dashboard/conversations
router.get('/conversations', getConversations);

// POST /api/dashboard/session/start
router.post('/session/start', startSession);

module.exports = router;
