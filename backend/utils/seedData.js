/**
 * Seed script — populates the database with a demo user, meetings,
 * settings, and sessions for development and testing purposes.
 *
 * Usage: node utils/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Settings = require('../models/Settings');
const Session = require('../models/Session');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected for seeding.');
};

const clearCollections = async () => {
  await User.deleteMany({});
  await Meeting.deleteMany({});
  await Settings.deleteMany({});
  await Session.deleteMany({});
  console.log('🗑️  Cleared existing data.');
};

const seedUsers = async () => {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const users = await User.insertMany([
    {
      name: 'Marcus Webb',
      email: 'marcus@cognitiveai.io',
      password: hashedPassword,
      company: 'Cognitive AI',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      name: 'Priya Nair',
      email: 'priya@cognitiveai.io',
      password: hashedPassword,
      company: 'Cognitive AI',
      role: 'user',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
  ]);

  console.log(`👤 Seeded ${users.length} users.`);
  return users;
};

const seedMeetings = async (userId) => {
  const meetings = [
    {
      userId,
      title: 'Q4 Executive Pipeline Review',
      participants: ['Marcus Webb', 'Priya Nair', 'James Okafor', 'Dana Cho'],
      duration: 52,
      transcript:
        'Marcus: I want to kick off by reviewing Q4 pipeline performance. Priya: Enterprise close rates are at 34% this quarter — up from 28% in Q3. James: The neural inference layer shipped ahead of schedule. Latency is down to 11 ms.',
      summary:
        'Strong Q4 performance confirmed with 34% enterprise close rate and 40% latency improvement. Series C materials to be updated. Two engineering hires approved.',
      sentimentScore: 0.74,
      keywords: ['Q4', 'pipeline', 'enterprise', 'latency', 'Series C', 'hiring'],
      project: 'Executive Strategy',
    },
    {
      userId,
      title: 'Series C Fundraising Strategy Session',
      participants: ['Marcus Webb', 'Dana Cho', 'Leila Farzan'],
      duration: 45,
      transcript:
        'Dana: Our burn rate is under control, tracking 3 points below budget. Marcus: We need to position unit economics front and center for investors. Leila: The AI roadmap is our strongest narrative.',
      summary:
        'Fundraising strategy aligned on unit economics narrative and AI roadmap as core differentiators. Investor materials to be finalized by end of week.',
      sentimentScore: 0.62,
      keywords: ['Series C', 'fundraising', 'burn rate', 'unit economics', 'investor'],
      project: 'Finance',
    },
    {
      userId,
      title: 'H1 Product Roadmap Planning',
      participants: ['Leila Farzan', 'James Okafor', 'Marcus Webb'],
      duration: 68,
      transcript:
        'Leila: H1 roadmap is aggressive — three enterprise integrations plus the agent framework. James: I have three senior candidates in final rounds. Marcus: Hiring approved. Let\'s unblock the roadmap.',
      summary:
        'H1 roadmap confirmed with three enterprise integrations and agent framework. Two senior engineering hires approved to meet delivery capacity.',
      sentimentScore: 0.55,
      keywords: ['H1', 'roadmap', 'agent framework', 'integrations', 'capacity', 'engineering'],
      project: 'Product',
    },
    {
      userId,
      title: 'Neural Inference Layer — Performance Review',
      participants: ['James Okafor', 'Priya Nair'],
      duration: 30,
      transcript:
        'James: We\'ve achieved 11 ms average latency — a 40% improvement over last quarter. Priya: Customers are noticing the difference. Deal cycles are shortening.',
      summary:
        'Neural inference layer performance confirmed at 11 ms average latency, 40% improvement. Positive sales impact with shorter deal cycles observed.',
      sentimentScore: 0.89,
      keywords: ['latency', 'performance', 'neural inference', 'sales', 'optimization'],
      project: 'Engineering',
    },
    {
      userId,
      title: 'Enterprise Integration — Slack & Notion Kickoff',
      participants: ['James Okafor', 'Leila Farzan', 'Marcus Webb'],
      duration: 40,
      transcript:
        'James: Slack and Notion integrations are scoped and ready. Leila: We'll target GA in 6 weeks. Marcus: Make sure enterprise accounts get early access.',
      summary:
        'Slack and Notion integrations officially kicked off. 6-week GA timeline confirmed. Enterprise accounts to receive early access program.',
      sentimentScore: 0.71,
      keywords: ['Slack', 'Notion', 'integration', 'enterprise', 'GA', 'early access'],
      project: 'Product',
    },
    {
      userId,
      title: 'AI-Assisted Outreach Sequence Retrospective',
      participants: ['Priya Nair', 'Marcus Webb'],
      duration: 25,
      transcript:
        'Priya: The AI-assisted sequences lifted open rates by 22% and response rates by 18%. Marcus: This is now our standard playbook. Roll it out to all AEs.',
      summary:
        'AI-assisted outreach sequences validated with strong performance improvements. Standardizing across all account executives.',
      sentimentScore: 0.81,
      keywords: ['outreach', 'AI', 'sequences', 'open rate', 'response rate', 'sales'],
      project: 'Sales',
    },
  ];

  const created = await Meeting.insertMany(meetings);
  console.log(`📅 Seeded ${created.length} meetings.`);
};

const seedSettings = async (userId) => {
  await Settings.create({
    userId,
    encryptionTier: 'quantum',
    aiModel: 'cognitive-ultra',
    voiceTone: 'formal',
    integrations: {
      slack: true,
      github: true,
      notion: false,
    },
    webhookUrl: 'https://hooks.example.com/cognitive-ai',
    themeMode: 'dark',
  });

  console.log('⚙️  Seeded default settings.');
};

const seedSessions = async (userId) => {
  const sessions = Array.from({ length: 12 }, (_, i) => ({
    userId,
    status: i < 3 ? 'live' : i < 8 ? 'archived' : 'terminated',
    latency: Math.floor(Math.random() * 20) + 8,
    tokenEfficiency: parseFloat((98 + Math.random() * 2).toFixed(1)),
    createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000), // spaced 2 hours apart
  }));

  await Session.insertMany(sessions);
  console.log(`🔌 Seeded ${sessions.length} sessions.`);
};

const seed = async () => {
  try {
    await connectDB();
    await clearCollections();

    const users = await seedUsers();
    const adminUser = users[0]; // Marcus Webb

    await seedMeetings(adminUser._id);
    await seedSettings(adminUser._id);
    await seedSessions(adminUser._id);

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────────────────');
    console.log('Demo login credentials:');
    console.log('  Email:    marcus@cognitiveai.io');
    console.log('  Password: password123');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
