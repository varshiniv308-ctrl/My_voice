/**
 * @desc    Get simulated live transcript messages
 * @route   GET /api/transcript/live
 * @access  Private
 */
const getLiveTranscript = async (req, res, next) => {
  try {
    // Simulated real-time transcript stream data
    const liveMessages = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        speaker: 'CEO — Marcus Webb',
        role: 'host',
        text: 'I want to kick off by reviewing Q4 pipeline performance. The numbers are strong, but we need to double down on enterprise conversion rates.',
        sentiment: 'positive',
        confidence: 0.97,
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 4.5 * 60 * 1000).toISOString(),
        speaker: 'VP Sales — Priya Nair',
        role: 'participant',
        text: 'Agreed. Enterprise close rates are at 34% this quarter — up from 28% in Q3. The new AI-assisted outreach sequences are clearly paying off.',
        sentiment: 'positive',
        confidence: 0.95,
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        speaker: 'CTO — James Okafor',
        role: 'participant',
        text: 'On the product side, we've shipped the neural inference layer ahead of schedule. Latency is down to 11 ms on average — that's a 40% improvement.',
        sentiment: 'positive',
        confidence: 0.98,
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 3.5 * 60 * 1000).toISOString(),
        speaker: 'CFO — Dana Cho',
        role: 'participant',
        text: 'The efficiency gains are reflected in COGS. We're tracking 3 points below budget for this quarter. Burn rate is under control.',
        sentiment: 'neutral',
        confidence: 0.92,
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        speaker: 'CEO — Marcus Webb',
        role: 'host',
        text: 'Good. Dana, let's make sure Series C materials reflect those efficiency metrics front and center. Investors are watching our unit economics closely.',
        sentiment: 'neutral',
        confidence: 0.94,
      },
      {
        id: 6,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        speaker: 'VP Product — Leila Farzan',
        role: 'participant',
        text: 'One concern — our roadmap for H1 next year is aggressive. If we're committing to three enterprise integrations plus the agent framework, we need two more senior engineers minimum.',
        sentiment: 'negative',
        confidence: 0.91,
      },
      {
        id: 7,
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        speaker: 'CTO — James Okafor',
        role: 'participant',
        text: 'I have three candidates in final rounds. I can expedite one offer this week if headcount is approved today.',
        sentiment: 'positive',
        confidence: 0.96,
      },
      {
        id: 8,
        timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
        speaker: 'CEO — Marcus Webb',
        role: 'host',
        text: 'Approved. Let's not let hiring bottleneck the roadmap again. James, coordinate with Dana on the comp packages by end of week.',
        sentiment: 'positive',
        confidence: 0.98,
      },
    ];

    res.status(200).json({
      success: true,
      message: 'Live transcript fetched successfully.',
      data: {
        sessionId: `sess_${Date.now()}`,
        status: 'live',
        startedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        messages: liveMessages,
        totalTokens: 1842,
        processingLatency: '11 ms',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI-generated transcript summary and analysis
 * @route   GET /api/transcript/summary
 * @access  Private
 */
const getTranscriptSummary = async (req, res, next) => {
  try {
    const summary = {
      summary:
        'Executive leadership reviewed strong Q4 performance metrics, including a 34% enterprise close rate and a 40% latency improvement in the neural inference layer. Budget tracking is favorable at 3 points below forecast. Key decisions were made around hiring two senior engineers and accelerating the H1 product roadmap. Series C materials are to be updated with efficiency metrics.',

      actionItems: [
        {
          id: 1,
          assignee: 'Dana Cho',
          task: 'Update Series C investor materials with Q4 unit economics and efficiency metrics.',
          deadline: 'End of week',
          priority: 'high',
        },
        {
          id: 2,
          assignee: 'James Okafor',
          task: 'Expedite one senior engineer offer and coordinate comp packages with Dana.',
          deadline: 'End of week',
          priority: 'high',
        },
        {
          id: 3,
          assignee: 'Priya Nair',
          task: 'Prepare detailed breakdown of AI-assisted outreach sequence ROI for next all-hands.',
          deadline: 'Next week',
          priority: 'medium',
        },
      ],

      objectives: [
        'Review Q4 pipeline and enterprise conversion performance',
        'Align on product roadmap capacity and headcount needs',
        'Prepare Series C fundraising materials',
        'Approve engineering hires to unblock H1 roadmap',
      ],

      entities: {
        people: ['Marcus Webb', 'Priya Nair', 'James Okafor', 'Dana Cho', 'Leila Farzan'],
        topics: ['Series C', 'Q4 pipeline', 'enterprise integrations', 'agent framework', 'neural inference layer'],
        metrics: ['34% close rate', '11 ms latency', '40% improvement', '3 points below budget'],
        decisions: ['Headcount approved for two senior engineers', 'H1 roadmap confirmed as committed'],
      },

      sentimentBreakdown: {
        overall: 'positive',
        score: 0.74,
        distribution: {
          positive: 62,
          neutral: 28,
          negative: 10,
        },
        highlightedTurns: {
          mostPositive: 'CTO reporting 40% latency improvement',
          mostConcerning: 'VP Product flagging roadmap capacity risk',
        },
      },
    };

    res.status(200).json({
      success: true,
      message: 'Transcript summary generated successfully.',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLiveTranscript, getTranscriptSummary };
