const Meeting = require('../models/Meeting');

/**
 * @desc    Get all meetings with pagination, search, and filters
 * @route   GET /api/meetings
 * @access  Private
 */
const getMeetings = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Build dynamic filter query
    const filter = { userId };

    // Title search (case-insensitive)
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by project
    if (req.query.project) {
      filter.project = { $regex: req.query.project, $options: 'i' };
    }

    // Filter by participant name
    if (req.query.participant) {
      filter.participants = {
        $elemMatch: { $regex: req.query.participant, $options: 'i' },
      };
    }

    // Filter by keyword
    if (req.query.keyword) {
      filter.keywords = {
        $elemMatch: { $regex: req.query.keyword, $options: 'i' },
      };
    }

    const total = await Meeting.countDocuments(filter);

    const meetings = await Meeting.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Meetings fetched successfully.',
      data: {
        meetings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single meeting by ID
 * @route   GET /api/meetings/:id
 * @access  Private
 */
const getMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meeting fetched successfully.',
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new meeting
 * @route   POST /api/meetings
 * @access  Private
 */
const createMeeting = async (req, res, next) => {
  try {
    const {
      title,
      participants,
      duration,
      transcript,
      summary,
      sentimentScore,
      keywords,
      project,
    } = req.body;

    const meeting = await Meeting.create({
      userId: req.user._id,
      title,
      participants: participants || [],
      duration: duration || 0,
      transcript: transcript || '',
      summary: summary || '',
      sentimentScore: sentimentScore || 0,
      keywords: keywords || [],
      project: project || 'General',
    });

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully.',
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing meeting
 * @route   PUT /api/meetings/:id
 * @access  Private
 */
const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found.',
      });
    }

    const allowedFields = [
      'title',
      'participants',
      'duration',
      'transcript',
      'summary',
      'sentimentScore',
      'keywords',
      'project',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    const updatedMeeting = await meeting.save();

    res.status(200).json({
      success: true,
      message: 'Meeting updated successfully.',
      data: updatedMeeting,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a meeting
 * @route   DELETE /api/meetings/:id
 * @access  Private
 */
const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully.',
      data: { _id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};
