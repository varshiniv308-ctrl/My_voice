/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║          COGNITIVE AI — Executive Intelligence Suite                    ║
 * ║                    Complete Database Layer                              ║
 * ║                                                                         ║
 * ║  All files bundled into one self-contained Node.js script.             ║
 * ║  Run:  node cognitive-ai-database.js                                   ║
 * ║                                                                         ║
 * ║  Requires: npm install mongoose dotenv                                  ║
 * ║  Set MONGO_URI in environment or use default localhost                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * FILE INDEX
 * ──────────────────────────────────────────────────────
 *  §1  package.json          (printed as comment)
 *  §2  .env.example          (printed as comment)
 *  §3  db.js                 connectDB()
 *  §4  models/User.js        UserSchema
 *  §5  models/Meeting.js     MeetingSchema
 *  §6  models/Session.js     SessionSchema
 *  §7  models/Settings.js    SettingsSchema
 *  §8  models/AuditLog.js    AuditLogSchema
 *  §9  seed.js               full seed runner (entry point)
 * §10  README.md             (printed as comment)
 * ──────────────────────────────────────────────────────
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────────
 * §1  PACKAGE.JSON  (reference — not executable)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "name": "cognitive-ai-database",
 *   "version": "1.0.0",
 *   "description": "Database layer for Cognitive AI Executive Intelligence Suite",
 *   "main": "cognitive-ai-database.js",
 *   "scripts": {
 *     "start": "node cognitive-ai-database.js",
 *     "dev":   "nodemon cognitive-ai-database.js"
 *   },
 *   "dependencies": {
 *     "dotenv":   "^16.4.5",
 *     "mongoose": "^8.4.0"
 *   },
 *   "devDependencies": {
 *     "nodemon": "^3.1.0"
 *   },
 *   "engines": { "node": ">=18.0.0" }
 * }
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * §2  .ENV.EXAMPLE  (reference — not executable)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * PORT=5000
 * MONGO_URI=mongodb://127.0.0.1:27017/cognitive_ai
 * NODE_ENV=development
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * §10  README.MD  (reference — not executable)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * # Cognitive AI — Database Layer
 *
 * ## Requirements
 * - Node.js >= 18
 * - MongoDB running locally (or provide Atlas URI)
 *
 * ## Install
 *   npm install mongoose dotenv
 *
 * ## Setup environment
 *   Copy .env.example to .env and edit MONGO_URI if needed.
 *   Or just export the variable:
 *     export MONGO_URI=mongodb://127.0.0.1:27017/cognitive_ai
 *
 * ## Run the full seed (this file)
 *   node cognitive-ai-database.js
 *
 * ## Mongo shell verification
 *   mongosh cognitive_ai
 *   db.users.countDocuments()        // → 6
 *   db.meetings.countDocuments()     // → 15
 *   db.sessions.countDocuments()     // → 5
 *   db.settings.countDocuments()     // → 6
 *   db.auditlogs.countDocuments()    // → 10
 *
 *   db.users.find({role:'admin'}).pretty()
 *   db.meetings.find({status:'completed'}).limit(5).pretty()
 *   db.meetings.createIndex({title:'text', keywords:'text'})
 *   db.auditlogs.find().sort({createdAt:-1}).limit(5).pretty()
 */

// ─── runtime dependencies ───────────────────────────────────────────────────
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

// ═════════════════════════════════════════════════════════════════════════════
// §3  DB.JS — DATABASE CONNECTION
// ═════════════════════════════════════════════════════════════════════════════

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cognitive_ai';

/**
 * connectDB — establishes a Mongoose connection.
 * Returns the mongoose instance so callers can await it.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Mongoose 8 no longer needs useNewUrlParser / useUnifiedTopology
      serverSelectionTimeoutMS: 5000,
    });
    console.log(
      `\n✅  MongoDB connected  →  ${conn.connection.host}/${conn.connection.name}\n`
    );
    return conn;
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// §4  MODELS/USER.JS
// ═════════════════════════════════════════════════════════════════════════════

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: { values: ['admin', 'user'], message: 'Role must be admin or user' },
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: initials derived from name
userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Index already created by unique:true on email; add compound for active users
userSchema.index({ role: 1, isActive: 1 });

const User = model('User', userSchema);

// ═════════════════════════════════════════════════════════════════════════════
// §5  MODELS/MEETING.JS
// ═════════════════════════════════════════════════════════════════════════════

const meetingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    project: {
      type: String,
      trim: true,
      default: 'General',
    },
    participants: {
      type: [String],
      default: [],
    },
    duration: {
      type: String, // stored as human-readable e.g. "1h 24m"
      default: '0m',
    },
    transcript: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    sentimentScore: {
      type: Number,
      min: [0, 'Sentiment score cannot be below 0'],
      max: [100, 'Sentiment score cannot exceed 100'],
      default: 50,
    },
    keywords: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'live', 'archived'],
        message: 'Status must be completed, live, or archived',
      },
      default: 'completed',
    },
    audioSizeMB: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Full-text search index on title + keywords
meetingSchema.index({ title: 'text', keywords: 'text', summary: 'text' });
// Recency index for dashboard queries
meetingSchema.index({ createdAt: -1 });
// Compound: user + status for filtered dashboards
meetingSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Virtual: sentiment label
meetingSchema.virtual('sentimentLabel').get(function () {
  if (this.sentimentScore >= 70) return 'positive';
  if (this.sentimentScore >= 40) return 'neutral';
  return 'critical';
});

const Meeting = model('Meeting', meetingSchema);

// ═════════════════════════════════════════════════════════════════════════════
// §6  MODELS/SESSION.JS
// ═════════════════════════════════════════════════════════════════════════════

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    sessionName: {
      type: String,
      trim: true,
      default: 'Unnamed Session',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'ended'],
        message: 'Status must be active or ended',
      },
      default: 'active',
    },
    latency: {
      type: Number, // milliseconds
      min: 0,
      default: 0,
    },
    tokenEfficiency: {
      type: Number, // percentage 0-100
      min: 0,
      max: 100,
      default: 0,
    },
    streamCount: {
      type: Number,
      min: 0,
      default: 1,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: session duration in seconds (only when ended)
sessionSchema.virtual('durationSeconds').get(function () {
  if (!this.endedAt || !this.startedAt) return null;
  return Math.round((this.endedAt - this.startedAt) / 1000);
});

sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ startedAt: -1 });

const Session = model('Session', sessionSchema);

// ═════════════════════════════════════════════════════════════════════════════
// §7  MODELS/SETTINGS.JS
// ═════════════════════════════════════════════════════════════════════════════

const settingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true, // one settings document per user
    },
    encryptionTier: {
      type: String,
      enum: {
        values: ['basic', 'advanced', 'quantum'],
        message: 'Encryption tier must be basic, advanced, or quantum',
      },
      default: 'advanced',
    },
    aiModel: {
      type: String,
      enum: {
        values: ['GPT Enterprise', 'Claude Neural', 'Gemini Ops'],
        message: 'AI model must be GPT Enterprise, Claude Neural, or Gemini Ops',
      },
      default: 'Claude Neural',
    },
    voiceSensitivity: {
      type: Number,
      min: 0,
      max: 100,
      default: 72,
    },
    noiseCancellation: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    speakerSeparation: {
      type: Number,
      min: 0,
      max: 100,
      default: 90,
    },
    confidenceThreshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 65,
    },
    integrations: {
      slack:  { type: Boolean, default: false },
      github: { type: Boolean, default: false },
      notion: { type: Boolean, default: false },
    },
    webhookUrl: {
      type: String,
      trim: true,
      default: '',
      match: [
        /^(https?:\/\/.*)?$/,
        'Webhook URL must be a valid http/https URL or empty',
      ],
    },
    themeMode: {
      type: String,
      enum: { values: ['dark', 'light'], message: 'Theme must be dark or light' },
      default: 'dark',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Settings = model('Settings', settingsSchema);

// ═════════════════════════════════════════════════════════════════════════════
// §8  MODELS/AUDITLOG.JS
// ═════════════════════════════════════════════════════════════════════════════

const auditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      maxlength: [120, 'Action string cannot exceed 120 characters'],
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      enum: {
        values: [
          'auth',
          'meetings',
          'sessions',
          'settings',
          'archive',
          'integrations',
          'admin',
        ],
        message: 'Module must be one of the defined application modules',
      },
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '0.0.0.0',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    // AuditLogs are append-only — only createdAt matters
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL index: auto-delete audit logs older than 2 years (63,072,000 seconds)
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 63_072_000, name: 'ttl_2yr' }
);
auditLogSchema.index({ userId: 1, module: 1, createdAt: -1 });

const AuditLog = model('AuditLog', auditLogSchema);

// ═════════════════════════════════════════════════════════════════════════════
// §9  SEED.JS — FULL SEED RUNNER
// ═════════════════════════════════════════════════════════════════════════════

// ── helpers ──────────────────────────────────────────────────────────────────

/** Generate a realistic past date within the last `days` days */
function pastDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * days));
  d.setHours(
    8 + Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 60)
  );
  return d;
}

/** Pick one item from an array at random */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Return a random integer between min and max (inclusive) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── seed data definitions ────────────────────────────────────────────────────

const ADMIN_USER = {
  name: 'Alexandra Chen',
  email: 'a.chen@nexuscapital.com',
  password: '$2b$12$hashed_admin_password_placeholder', // bcrypt hash placeholder
  company: 'Nexus Capital Group',
  role: 'admin',
  avatar: 'https://avatars.example.com/a-chen.jpg',
  lastLogin: new Date(),
  isActive: true,
};

const REGULAR_USERS = [
  {
    name: 'Marcus Rivera',
    email: 'm.rivera@nexuscapital.com',
    password: '$2b$12$hashed_password_marcus',
    company: 'Nexus Capital Group',
    role: 'user',
    isActive: true,
  },
  {
    name: 'Jordan Lee',
    email: 'j.lee@nexuscapital.com',
    password: '$2b$12$hashed_password_jordan',
    company: 'Nexus Capital Group',
    role: 'user',
    isActive: true,
  },
  {
    name: 'Priya Sharma',
    email: 'p.sharma@nexuscapital.com',
    password: '$2b$12$hashed_password_priya',
    company: 'Nexus Capital Group',
    role: 'user',
    isActive: true,
  },
  {
    name: 'Daniel Osei',
    email: 'd.osei@nexuscapital.com',
    password: '$2b$12$hashed_password_daniel',
    company: 'Nexus Capital Group',
    role: 'user',
    isActive: false, // deactivated — demonstrates isActive flag
  },
  {
    name: 'Sofia Russo',
    email: 's.russo@atlas-ventures.io',
    password: '$2b$12$hashed_password_sofia',
    company: 'Atlas Ventures',
    role: 'user',
    isActive: true,
  },
];

const MEETING_TEMPLATES = [
  {
    title: 'CEO Strategy Sync — Q4 2024',
    project: 'Strategy',
    participants: ['Alexandra Chen', 'Marcus Rivera', 'Jordan Lee', 'Board Observer'],
    duration: '1h 24m',
    summary:
      'Reviewed Q4 financial projections against board targets. Revenue at 19% YoY growth; target is 23%. Two enterprise accounts (Sigma Corp, Atlas Group) in final procurement stages. Series B close targeted for November 15.',
    sentimentScore: 76,
    keywords: ['Revenue', 'Q4', 'Series B', 'Strategy', 'Growth', 'Board'],
    status: 'completed',
    audioSizeMB: 84.2,
  },
  {
    title: 'Investor Review — Series B Deep Dive',
    project: 'Investor Relations',
    participants: ['Alexandra Chen', 'Marcus Rivera', 'Lead VC Partner', 'Associate'],
    duration: '58m',
    summary:
      'Term sheet negotiation with lead investor. Post-money valuation at $120M agreed in principle. Liquidation preferences and pro-rata rights still under discussion. Next call scheduled for October 30.',
    sentimentScore: 54,
    keywords: ['Series B', 'Valuation', 'Cap Table', 'Term Sheet', 'VC', 'Dilution'],
    status: 'completed',
    audioSizeMB: 56.7,
  },
  {
    title: 'Product Planning — Q1 2025 Roadmap',
    project: 'Product',
    participants: ['Jordan Lee', 'Priya Sharma', 'Engineering Lead', 'Design Lead', 'PM', 'QA', 'DevOps', 'Marketing'],
    duration: '2h 10m',
    summary:
      'Finalized Q1 roadmap with 4 epics: Neural pipeline v2.5, mobile companion app, Salesforce integration, and advanced analytics dashboard. Sprint capacity calculated at 220 story points per 2-week cycle.',
    sentimentScore: 82,
    keywords: ['Roadmap', 'Sprint', 'Launch', 'v2.5', 'Mobile', 'Salesforce'],
    status: 'completed',
    audioSizeMB: 128.4,
  },
  {
    title: 'Board Pre-read Alignment Session',
    project: 'Governance',
    participants: ['Alexandra Chen', 'Marcus Rivera', 'General Counsel'],
    duration: '45m',
    summary:
      'Prepared board deck and addressed outstanding audit findings. Three compliance items flagged by external auditor require remediation before December meeting. SOC 2 Type II certification on track for Q1.',
    sentimentScore: 31,
    keywords: ['Risk', 'Compliance', 'Audit', 'SOC2', 'Board', 'Governance'],
    status: 'archived',
    audioSizeMB: 43.1,
  },
  {
    title: 'Engineering All-hands — October Sprint Review',
    project: 'Engineering',
    participants: Array.from({ length: 12 }, (_, i) => `Engineer ${i + 1}`),
    duration: '22m',
    summary:
      'Sprint 44 review: 94% story points delivered. Critical bug in inference pipeline patched. Deployment pipeline upgraded to zero-downtime blue-green strategy. Velocity trending up 8% month-over-month.',
    sentimentScore: 79,
    keywords: ['Deployment', 'CI/CD', 'Bugs', 'Sprint', 'Velocity', 'Performance'],
    status: 'completed',
    audioSizeMB: 21.8,
  },
  {
    title: 'GTM Strategy Review — Enterprise Segment',
    project: 'Sales',
    participants: ['Marcus Rivera', 'Sales Director', 'SDR Lead', 'Customer Success', 'Marketing VP'],
    duration: '1h 35m',
    summary:
      'Pipeline coverage at 3.2x quota for Q4. ACV target $2.4M. Top 5 accounts reviewed with deal velocity analysis. Churn risk identified in 2 accounts — CSM escalation initiated.',
    sentimentScore: 58,
    keywords: ['Pipeline', 'ARR', 'Churn', 'Enterprise', 'ACV', 'Quota'],
    status: 'completed',
    audioSizeMB: 95.5,
  },
  {
    title: 'Hiring Committee — ML Engineering Track',
    project: 'People Ops',
    participants: ['Alexandra Chen', 'Jordan Lee', 'Head of Talent', 'Senior ML Engineer'],
    duration: '1h 02m',
    summary:
      'Reviewed 8 candidates for 3 Senior ML Engineer roles. Two offers extended to candidates with LLM fine-tuning and distributed inference backgrounds. Compensation benchmarked at P75 market rate.',
    sentimentScore: 73,
    keywords: ['ML Engineers', 'Culture', 'Offer', 'Hiring', 'Talent', 'Compensation'],
    status: 'completed',
    audioSizeMB: 62.0,
  },
  {
    title: 'Legal & Compliance Review — Q4',
    project: 'Legal',
    participants: ['Alexandra Chen', 'General Counsel', 'External Counsel'],
    duration: '48m',
    summary:
      'GDPR Article 28 DPA signed with three new data processors. SOC 2 evidence collection 78% complete. Contract review backlog cleared. One IP dispute resolved via settlement.',
    sentimentScore: 28,
    keywords: ['GDPR', 'SOC2', 'Contract', 'IP', 'Compliance', 'DPA'],
    status: 'archived',
    audioSizeMB: 46.3,
  },
  {
    title: 'Customer Advisory Board — Power Users',
    project: 'Product',
    participants: ['Jordan Lee', 'Priya Sharma', 'CAB Member 1', 'CAB Member 2', 'CAB Member 3'],
    duration: '1h 50m',
    summary:
      'Gathered structured feedback on v2.3 from 12 enterprise customers. Top feature requests: bulk export, SSO enforcement, custom entity taxonomy. NPS for the quarter: 62.',
    sentimentScore: 68,
    keywords: ['NPS', 'Feedback', 'SSO', 'Export', 'Enterprise', 'Feature Request'],
    status: 'completed',
    audioSizeMB: 110.9,
  },
  {
    title: 'Finance & Budget Planning — FY2025',
    project: 'Finance',
    participants: ['Alexandra Chen', 'CFO', 'Head of Finance', 'Department Heads'],
    duration: '2h 30m',
    summary:
      'FY2025 operating budget set at $18.4M with R&D allocated 42%. Headcount plan approved: 24 net new hires across Engineering, Sales, and Customer Success. Burn rate modeled at $1.1M/month pre-Series B close.',
    sentimentScore: 61,
    keywords: ['Budget', 'FY2025', 'Headcount', 'Burn Rate', 'Finance', 'R&D'],
    status: 'completed',
    audioSizeMB: 148.7,
  },
  {
    title: 'Security & Threat Intelligence Briefing',
    project: 'Security',
    participants: ['Alexandra Chen', 'CISO', 'Security Engineer', 'External Analyst'],
    duration: '40m',
    summary:
      'Monthly threat review. Phishing attempt volume up 34% YoY. Zero-trust rollout on schedule for November. Penetration test completed — 2 medium findings remediated, 0 critical findings.',
    sentimentScore: 45,
    keywords: ['Security', 'Zero-Trust', 'Pentest', 'Phishing', 'CISO', 'Threat'],
    status: 'completed',
    audioSizeMB: 38.5,
  },
  {
    title: 'Partnership Negotiation — Sigma Corp',
    project: 'Business Development',
    participants: ['Marcus Rivera', 'Sigma Corp VP Sales', 'Sigma Corp Legal'],
    duration: '1h 15m',
    summary:
      'Enterprise deal final negotiation. $480K ACV 3-year contract. Custom implementation scope agreed. SLA at 99.9% uptime with 4-hour response for P1 incidents. Contract signature expected by November 5.',
    sentimentScore: 84,
    keywords: ['Sigma Corp', 'Enterprise', 'Contract', 'ACV', 'SLA', 'Partnership'],
    status: 'completed',
    audioSizeMB: 75.2,
  },
  {
    title: 'Data Infrastructure Scaling Review',
    project: 'Engineering',
    participants: ['Priya Sharma', 'CTO', 'Data Engineer', 'DevOps Lead', 'DBA'],
    duration: '1h 08m',
    summary:
      'Reviewed MongoDB Atlas cluster performance at 4M documents/day ingestion rate. Sharding strategy approved for user sessions collection. Redis cache layer reducing query latency by 68%.',
    sentimentScore: 77,
    keywords: ['MongoDB', 'Scaling', 'Redis', 'Sharding', 'Performance', 'Infra'],
    status: 'completed',
    audioSizeMB: 68.4,
  },
  {
    title: 'Mental Health & Culture Initiative',
    project: 'People Ops',
    participants: ['Alexandra Chen', 'People Ops Lead', 'External Facilitator'],
    duration: '55m',
    summary:
      'Anonymous survey results reviewed: 78% engagement score, up 6 points. Flexible Friday afternoons policy approved. Mental health stipend of $1,200/year per employee ratified by leadership.',
    sentimentScore: 91,
    keywords: ['Culture', 'Engagement', 'Wellness', 'Policy', 'People', 'Stipend'],
    status: 'completed',
    audioSizeMB: 53.6,
  },
  {
    title: 'Live Q4 All-Hands — Company Update',
    project: 'Leadership',
    participants: ['Alexandra Chen', 'All Employees'],
    duration: 'Live',
    summary: '',
    sentimentScore: 72,
    keywords: ['Q4', 'All-Hands', 'OKRs', 'Company', 'Vision', 'Goals'],
    status: 'live',
    audioSizeMB: 0,
  },
];

const SESSION_TEMPLATES = [
  { sessionName: 'CEO Strategy Sync — Live Feed', status: 'active', latency: 11, tokenEfficiency: 99.2, streamCount: 4 },
  { sessionName: 'Board Pre-read Alignment',      status: 'ended',  latency: 14, tokenEfficiency: 97.8, streamCount: 3 },
  { sessionName: 'Investor Due Diligence Call',   status: 'ended',  latency: 12, tokenEfficiency: 98.4, streamCount: 6 },
  { sessionName: 'Q1 Roadmap Workshop',           status: 'active', latency:  9, tokenEfficiency: 99.6, streamCount: 8 },
  { sessionName: 'GTM Quarterly Review',          status: 'ended',  latency: 16, tokenEfficiency: 96.9, streamCount: 5 },
];

const AUDIT_ACTIONS = [
  { action: 'USER_LOGIN',            module: 'auth',         metadata: { method: 'password', success: true } },
  { action: 'MEETING_CREATED',       module: 'meetings',     metadata: { title: 'CEO Strategy Sync', project: 'Strategy' } },
  { action: 'SETTINGS_UPDATED',      module: 'settings',     metadata: { changed: ['aiModel', 'encryptionTier'] } },
  { action: 'SESSION_STARTED',       module: 'sessions',     metadata: { streamCount: 4, latencyMs: 11 } },
  { action: 'MEETING_ARCHIVED',      module: 'archive',      metadata: { meetingId: 'placeholder', reason: 'manual' } },
  { action: 'INTEGRATION_TOGGLED',   module: 'integrations', metadata: { integration: 'slack', enabled: true } },
  { action: 'SESSION_ENDED',         module: 'sessions',     metadata: { durationMin: 84, tokenEfficiency: 99.2 } },
  { action: 'ADMIN_USER_DEACTIVATED',module: 'admin',        metadata: { targetUser: 'd.osei@nexuscapital.com' } },
  { action: 'USER_LOGOUT',           module: 'auth',         metadata: { sessionDurationMin: 142 } },
  { action: 'WEBHOOK_TEST_SENT',     module: 'integrations', metadata: { responseStatus: 200, latencyMs: 43 } },
];

const IP_POOL = [
  '10.0.1.42', '10.0.1.18', '10.0.2.5', '192.168.1.101', '172.16.0.44',
  '10.0.3.99', '10.0.1.200', '192.168.0.250',
];

// ── main seed function ────────────────────────────────────────────────────────

async function seed() {
  await connectDB();

  console.log('🌱  Starting seed process…\n');

  // ── 1. Wipe existing data ───────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Meeting.deleteMany({}),
    Session.deleteMany({}),
    Settings.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('🗑   Cleared existing collections');

  // ── 2. Create users ─────────────────────────────────────────────────────
  const admin = await User.create(ADMIN_USER);
  const regularUsers = await User.insertMany(REGULAR_USERS);
  const allUsers = [admin, ...regularUsers];
  console.log(`👤  Created ${allUsers.length} users  (1 admin + ${regularUsers.length} regular)`);

  // ── 3. Create meetings ──────────────────────────────────────────────────
  const meetingDocs = MEETING_TEMPLATES.map((tpl) => ({
    ...tpl,
    userId: pick(allUsers)._id,
    createdAt: pastDate(90),
  }));
  const meetings = await Meeting.insertMany(meetingDocs);
  console.log(`📁  Created ${meetings.length} meetings`);

  // ── 4. Create sessions ──────────────────────────────────────────────────
  const sessionDocs = SESSION_TEMPLATES.map((tpl) => {
    const started = pastDate(7);
    const ended =
      tpl.status === 'ended'
        ? new Date(started.getTime() + randInt(20, 130) * 60 * 1000)
        : null;
    return {
      ...tpl,
      userId: pick(allUsers)._id,
      startedAt: started,
      endedAt: ended,
    };
  });
  const sessions = await Session.insertMany(sessionDocs);
  console.log(`📡  Created ${sessions.length} sessions`);

  // ── 5. Create settings for every user ───────────────────────────────────
  const aiModels = ['GPT Enterprise', 'Claude Neural', 'Gemini Ops'];
  const encTiers = ['basic', 'advanced', 'quantum'];
  const settingsDocs = allUsers.map((u, i) => ({
    userId: u._id,
    encryptionTier: encTiers[i % encTiers.length],
    aiModel: aiModels[i % aiModels.length],
    voiceSensitivity: randInt(60, 95),
    noiseCancellation: randInt(70, 98),
    speakerSeparation: randInt(75, 99),
    confidenceThreshold: randInt(50, 80),
    integrations: {
      slack:  Math.random() > 0.4,
      github: Math.random() > 0.6,
      notion: Math.random() > 0.5,
    },
    webhookUrl: i === 0 ? 'https://hooks.nexuscapital.com/v1/cognitive' : '',
    themeMode: 'dark',
    notificationsEnabled: true,
  }));
  const settingsRecords = await Settings.insertMany(settingsDocs);
  console.log(`⚙️   Created ${settingsRecords.length} settings records`);

  // ── 6. Create audit logs ─────────────────────────────────────────────────
  const auditDocs = AUDIT_ACTIONS.map((tpl) => ({
    ...tpl,
    userId: pick(allUsers)._id,
    ipAddress: pick(IP_POOL),
    createdAt: pastDate(30),
  }));
  const auditLogs = await AuditLog.insertMany(auditDocs);
  console.log(`📋  Created ${auditLogs.length} audit log entries`);

  // ── 7. Summary ───────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('  ✅  COGNITIVE AI DATABASE SEED COMPLETE');
  console.log('══════════════════════════════════════════════');
  console.log(`  Database  : ${MONGO_URI}`);
  console.log(`  Users     : ${allUsers.length}  (admin: ${admin.email})`);
  console.log(`  Meetings  : ${meetings.length}`);
  console.log(`  Sessions  : ${sessions.length}`);
  console.log(`  Settings  : ${settingsRecords.length}`);
  console.log(`  Audit logs: ${auditLogs.length}`);
  console.log('══════════════════════════════════════════════\n');

  console.log('🔍  Quick verify in mongosh:');
  console.log('    mongosh cognitive_ai');
  console.log('    db.users.countDocuments()    // 6');
  console.log('    db.meetings.countDocuments() // 15');
  console.log('    db.sessions.countDocuments() // 5');
  console.log('    db.settings.countDocuments() // 6');
  console.log('    db.auditlogs.countDocuments()// 10\n');

  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB\n');
}

// ── entry point ──────────────────────────────────────────────────────────────
seed().catch((err) => {
  console.error('💥  Seed failed:', err);
  process.exit(1);
});

// ── named exports (for use as a library) ─────────────────────────────────────
module.exports = {
  connectDB,
  models: { User, Meeting, Session, Settings, AuditLog },
};
