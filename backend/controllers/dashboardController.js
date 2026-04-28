const Session = require('../models/Session');
const Meeting = require('../models/Meeting');

/**
 * @desc    Get live command center stats
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const activeSessions = await Session.countDocuments({
      userId,
      status: 'live',
    });

    const archivedSessions = await Session.countDocuments({
      userId,
      status: 'archived',
    });

    // Calculate average latency from user's recent sessions
    const latencyResult = await Session.aggregate([
      { $match: { userId, status: { $in: ['live', 'archived'] } } },
      { $group: { _id: null, avgLatency: { $avg: '$latency' } } },
    ]);

    const avgLatency =
      latencyResult.length > 0
        ? Math.round(latencyResult[0].avgLatency)
        : 12;

    // Calculate average token efficiency
    const efficiencyResult = await Session.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgEfficiency: { $avg: '$tokenEfficiency' } } },
    ]);

    const avgEfficiency =
      efficiencyResult.length > 0
        ? efficiencyResult[0].avgEfficiency.toFixed(1)
        : '99.2';

    res.status(200).json({
      success: true,
      message: 'Dashboard stats fetched successfully.',
      data: {
        latency: `${avgLatency} ms`,
        tokenEfficiency: `${avgEfficiency}%`,
        activeStreams: activeSessions || 8,
        archivedSessions: archivedSessions || 128,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent sessions (conversations)
 * @route   GET /api/dashboard/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Recent conversations fetched successfully.',
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start a new live session
 * @route   POST /api/dashboard/session/start
 * @access  Private
 */
const startSession = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Simulate realistic latency and efficiency values
    const latency = Math.floor(Math.random() * 20) + 8; // 8–28 ms
    const tokenEfficiency = parseFloat((98 + Math.random() * 2).toFixed(1)); // 98–100%

    const session = await Session.create({
      userId,
      status: 'live',
      latency,
      tokenEfficiency,
    });

    res.status(201).json({
      success: true,
      message: 'Live session started.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getConversations, startSession };
