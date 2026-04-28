const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

// Try to use Socket.io if available
let io = null;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });
} catch (e) {
  console.log('Socket.io not available, running without WebSocket support');
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── IN-MEMORY DATABASE ──────────────────────────────────────────────────────

const db = {
  users: [
    { id: 'u1', email: 'admin@cognitev.ai', password: 'admin123', name: 'Alexandra Chen', role: 'Executive', avatar: 'AC', department: 'C-Suite' },
    { id: 'u2', email: 'analyst@cognitev.ai', password: 'analyst123', name: 'Marcus Webb', role: 'Analyst', avatar: 'MW', department: 'Intelligence' },
    { id: 'u3', email: 'demo@demo.com', password: 'demo', name: 'Demo User', role: 'Viewer', avatar: 'DU', department: 'Product' }
  ],
  sessions: {},
  meetings: generateMeetings(),
  config: {
    aiEngine: { model: 'cognitive-v3', temperature: 0.72, maxTokens: 4096, streamLatency: 120 },
    voice: { language: 'en-US', speakerDiarization: true, noiseReduction: true, sensitivity: 0.85 },
    security: { mfa: true, encryptTranscripts: true, retentionDays: 90, auditLog: true },
    integrations: { slack: { enabled: true, webhook: 'https://hooks.slack.com/mock' }, github: { enabled: false }, notion: { enabled: true, token: '••••••••••••' } }
  }
};

function generateMeetings() {
  const projects = ['Project Helios', 'Atlas Initiative', 'Quantum Sprint', 'Neural Roadmap', 'Meridian Launch', 'Cipher Protocol'];
  const participants = [
    ['Alexandra Chen', 'Marcus Webb', 'Sarah Kim'],
    ['David Park', 'Emma Torres', 'Ryan Zhao'],
    ['Priya Nair', 'James Liu', 'Sofia Andersen'],
    ['Carlos Mendez', 'Aisha Osei', 'Tom Bradley'],
  ];
  const sentiments = ['positive', 'neutral', 'mixed', 'negative'];
  const meetings = [];
  for (let i = 0; i < 24; i++) {
    const date = new Date(Date.now() - i * 86400000 * Math.random() * 3);
    const proj = projects[i % projects.length];
    const parts = participants[i % participants.length];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const duration = 15 + Math.floor(Math.random() * 75);
    meetings.push({
      id: `m${i + 1}`,
      title: `${proj} — ${['Strategy Sync', 'Sprint Review', 'Deep Dive', 'Executive Brief', 'Alignment Call', 'Planning Session'][i % 6]}`,
      project: proj,
      participants: parts,
      date: date.toISOString(),
      duration,
      sentiment,
      sentimentScore: sentiment === 'positive' ? 0.72 + Math.random() * 0.28 : sentiment === 'negative' ? Math.random() * 0.35 : 0.35 + Math.random() * 0.37,
      summary: generateSummary(proj),
      actionItems: generateActionItems(),
      entities: generateEntities(),
      wordCount: 800 + Math.floor(Math.random() * 3200),
      transcript: generateTranscript(parts),
      tags: [proj.split(' ')[1], ['Q2', 'Q3', 'Q4'][i % 3], ['critical', 'routine', 'strategic'][i % 3]]
    });
  }
  return meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateSummary(project) {
  const summaries = [
    `The team reviewed current ${project} milestones and identified three critical blockers impacting the Q3 delivery timeline. Key decisions were made regarding resource reallocation and vendor negotiations. Consensus reached on the phased rollout approach with security review scheduled for next week.`,
    `${project} stakeholders aligned on revised scope following market analysis. Technical architecture discussion surfaced concerns about scalability at 10x load. Action items distributed across engineering, design, and product teams with bi-weekly check-ins established.`,
    `Executive review of ${project} performance metrics showed 23% ahead of projections. Risk assessment for international expansion completed. Board presentation materials approved pending legal review of compliance documentation.`
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

function generateActionItems() {
  const items = [
    { id: crypto.randomUUID(), text: 'Finalize vendor contract and submit for legal review', assignee: 'Marcus Webb', due: '2 days', priority: 'high', done: false },
    { id: crypto.randomUUID(), text: 'Deploy staging environment with updated security policies', assignee: 'Sarah Kim', due: '1 week', priority: 'critical', done: false },
    { id: crypto.randomUUID(), text: 'Prepare board presentation with Q3 performance data', assignee: 'Alexandra Chen', due: '3 days', priority: 'high', done: true },
    { id: crypto.randomUUID(), text: 'Run load testing at 10x capacity on new infrastructure', assignee: 'David Park', due: '5 days', priority: 'medium', done: false },
    { id: crypto.randomUUID(), text: 'Update API documentation and notify integration partners', assignee: 'Emma Torres', due: '1 week', priority: 'low', done: false },
  ];
  return items.slice(0, 2 + Math.floor(Math.random() * 3));
}

function generateEntities() {
  return {
    people: ['Alexandra Chen', 'Marcus Webb', 'Sarah Kim'].slice(0, 1 + Math.floor(Math.random() * 2)),
    organizations: ['Anthropic', 'AWS', 'Stripe', 'Vercel'].slice(0, 1 + Math.floor(Math.random() * 2)),
    technologies: ['Kubernetes', 'PostgreSQL', 'React', 'LangChain', 'Pinecone'].slice(0, 2 + Math.floor(Math.random() * 2)),
    dates: ['Q3 2025', 'end of month', 'next sprint'].slice(0, 1 + Math.floor(Math.random() * 2)),
    metrics: ['23% growth', '$2.4M ARR', '99.97% uptime'].slice(0, 1 + Math.floor(Math.random() * 2))
  };
}

function generateTranscript(participants) {
  const lines = [
    { speaker: participants[0], time: '00:00', text: "Alright, let's get started. Thanks everyone for joining. Quick agenda check — we're covering the milestone review, then blockers, then next steps." },
    { speaker: participants[1], time: '00:42', text: "Before we dive in — I pulled the latest metrics this morning. We're tracking at 94% of target for the quarter, which is actually ahead of where we expected." },
    { speaker: participants[2] || participants[0], time: '01:15', text: "That's great to hear. The infrastructure migration definitely helped. Though I want to flag the latency issues we saw in staging last week." },
    { speaker: participants[0], time: '02:03', text: "Agreed. Marcus, can you walk us through what you found? I want to make sure we have a clear picture before the board presentation." },
    { speaker: participants[1], time: '02:18', text: "Sure. So the P99 latency spiked to 340ms under load — that's above our 200ms SLA. Root cause was the new caching layer not warming properly on cold starts." },
    { speaker: participants[2] || participants[0], time: '03:44', text: "I can have a fix deployed to staging by Thursday. We'd need two days of soak time before we feel confident pushing to production." },
    { speaker: participants[0], time: '04:12', text: "That timeline works. Let's make sure the fix is in before the demo next Monday. What about the vendor contract — any updates?" },
    { speaker: participants[1], time: '04:58', text: "Still in legal review. They flagged two clauses around data residency. I'm optimistic we can resolve it this week, but I'll need your sign-off on the revised terms." },
    { speaker: participants[0], time: '05:30', text: "Send it over this afternoon. I'll prioritize it. Alright, let's talk about resourcing for the next sprint..." },
  ];
  return lines;
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = { userId: user.id, createdAt: Date.now() };
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser, expiresIn: 86400 });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, role = 'Analyst' } = req.body;
  if (db.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const user = { id: `u${db.users.length + 1}`, email, password, name, role, avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(), department: 'New Team' };
  db.users.push(user);
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = { userId: user.id, createdAt: Date.now() };
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) delete db.sessions[token];
  res.json({ success: true });
});

// ─── METRICS ROUTES ──────────────────────────────────────────────────────────

app.get('/api/metrics/live', (req, res) => {
  res.json({
    latency: { current: 80 + Math.floor(Math.random() * 80), p50: 95, p95: 180, p99: 340 },
    tokenEfficiency: { tokensPerSecond: 180 + Math.floor(Math.random() * 60), costPer1k: 0.0042, totalToday: 284750 + Math.floor(Math.random() * 1000) },
    sessions: { active: 3 + Math.floor(Math.random() * 5), today: 14, thisWeek: 67, avgDuration: 38 },
    sentiment: { positive: 62 + Math.floor(Math.random() * 10), neutral: 24, negative: 14 },
    waveform: Array.from({ length: 32 }, () => Math.random()),
    uptime: 99.97,
    modelsLoaded: 3,
    queueDepth: Math.floor(Math.random() * 4)
  });
});

app.get('/api/metrics/history', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const data = Array.from({ length: hours }, (_, i) => ({
    time: new Date(Date.now() - (hours - i) * 3600000).toISOString(),
    latency: 70 + Math.floor(Math.random() * 100),
    sessions: Math.floor(Math.random() * 8),
    tokens: 10000 + Math.floor(Math.random() * 30000),
    sentiment: 0.5 + Math.random() * 0.4
  }));
  res.json(data);
});

// ─── MEETING / TRANSCRIPT ROUTES ─────────────────────────────────────────────

app.post('/api/meeting/start', (req, res) => {
  const sessionId = crypto.randomUUID();
  res.json({
    sessionId,
    status: 'active',
    startedAt: new Date().toISOString(),
    model: 'cognitive-v3',
    features: ['transcription', 'summarization', 'sentiment', 'entity-extraction']
  });
});

app.post('/api/meeting/transcript/chunk', (req, res) => {
  const speakers = ['Alexandra Chen', 'Marcus Webb', 'Sarah Kim'];
  const lines = [
    "We need to align on the technical architecture before moving forward with the vendor evaluation.",
    "The latency numbers look promising — we're down to 87ms on average with the new caching strategy.",
    "I'd like to table the compliance discussion until we have legal's input on the data residency clauses.",
    "Can we get a commitment on the infrastructure timeline? The board is asking for specifics.",
    "The sentiment from the client last week was overwhelmingly positive about the new interface.",
    "Let's prioritize the security audit. We can't ship without the penetration test results.",
    "Our token efficiency improved 34% after the prompt optimization pass — significant cost savings.",
    "I'm flagging the API rate limits as a blocker. We need to escalate with the vendor today.",
  ];
  const chunks = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
    id: crypto.randomUUID(),
    speaker: speakers[Math.floor(Math.random() * speakers.length)],
    text: lines[Math.floor(Math.random() * lines.length)],
    timestamp: new Date().toISOString(),
    sentiment: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
    confidence: 0.91 + Math.random() * 0.09
  }));
  res.json({ chunks, sessionId: req.body.sessionId });
});

app.post('/api/meeting/summarize', (req, res) => {
  const { transcript } = req.body;
  setTimeout(() => {
    res.json({
      summary: "The team reviewed technical architecture decisions and aligned on vendor evaluation criteria. Key concerns raised around latency performance and data compliance requirements. Infrastructure timeline confirmed for Q3 delivery with security audit as prerequisite.",
      keyPoints: [
        "Technical architecture alignment required before vendor evaluation proceeds",
        "Latency optimized to 87ms average — 34% improvement from caching strategy",
        "Legal review of data residency clauses is blocking contract finalization",
        "Security audit and penetration testing are hard prerequisites for launch",
        "Board presentation requires specific infrastructure delivery timeline"
      ],
      confidence: 0.94,
      processingTime: 340 + Math.floor(Math.random() * 200)
    });
  }, 300 + Math.random() * 400);
});

app.post('/api/meeting/sentiment', (req, res) => {
  res.json({
    overall: { score: 0.67, label: 'positive', confidence: 0.89 },
    timeline: Array.from({ length: 10 }, (_, i) => ({
      segment: i,
      score: 0.3 + Math.random() * 0.6,
      dominant: Math.random() > 0.4 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative'
    })),
    bySpeaker: {
      'Alexandra Chen': { score: 0.74, dominant: 'positive' },
      'Marcus Webb': { score: 0.61, dominant: 'positive' },
      'Sarah Kim': { score: 0.55, dominant: 'neutral' }
    },
    topics: { technical: 0.58, strategic: 0.72, financial: 0.65 }
  });
});

app.post('/api/meeting/entities', (req, res) => {
  res.json({
    people: ['Alexandra Chen', 'Marcus Webb', 'Sarah Kim', 'Board of Directors'],
    organizations: ['AWS', 'Stripe', 'Anthropic', 'Legal Team'],
    technologies: ['Kubernetes', 'PostgreSQL', 'LangChain', 'Redis Cache'],
    dates: ['Q3 delivery', 'end of week', 'next Monday'],
    metrics: ['87ms latency', '34% improvement', '99.97% uptime'],
    actionItems: [
      { text: 'Escalate API rate limit issue with vendor', assignee: 'Marcus Webb', priority: 'high' },
      { text: 'Complete security audit before launch', assignee: 'Sarah Kim', priority: 'critical' },
      { text: 'Prepare board presentation with infrastructure timeline', assignee: 'Alexandra Chen', priority: 'high' }
    ]
  });
});

// ─── ARCHIVE ROUTES ───────────────────────────────────────────────────────────

app.get('/api/archive/meetings', (req, res) => {
  let results = [...db.meetings];
  const { search, project, participant, sentiment, limit = 20, offset = 0 } = req.query;

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.project.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (project) results = results.filter(m => m.project === project);
  if (participant) results = results.filter(m => m.participants.some(p => p.toLowerCase().includes(participant.toLowerCase())));
  if (sentiment) results = results.filter(m => m.sentiment === sentiment);

  const total = results.length;
  results = results.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    meetings: results,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    facets: {
      projects: [...new Set(db.meetings.map(m => m.project))],
      sentiments: ['positive', 'neutral', 'mixed', 'negative'],
      participants: [...new Set(db.meetings.flatMap(m => m.participants))]
    }
  });
});

app.get('/api/archive/meetings/:id', (req, res) => {
  const meeting = db.meetings.find(m => m.id === req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  res.json(meeting);
});

app.get('/api/archive/analytics', (req, res) => {
  const total = db.meetings.length;
  const totalMinutes = db.meetings.reduce((sum, m) => sum + m.duration, 0);
  const sentimentBreakdown = db.meetings.reduce((acc, m) => {
    acc[m.sentiment] = (acc[m.sentiment] || 0) + 1;
    return acc;
  }, {});
  const byProject = db.meetings.reduce((acc, m) => {
    acc[m.project] = (acc[m.project] || 0) + 1;
    return acc;
  }, {});
  res.json({
    total,
    totalHours: Math.round(totalMinutes / 60),
    avgDuration: Math.round(totalMinutes / total),
    sentimentBreakdown,
    byProject,
    avgSentimentScore: (db.meetings.reduce((s, m) => s + m.sentimentScore, 0) / total).toFixed(3),
    totalActionItems: db.meetings.reduce((s, m) => s + m.actionItems.length, 0),
    topParticipants: Object.entries(
      db.meetings.flatMap(m => m.participants).reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))
  });
});

// ─── CONFIG ROUTES ────────────────────────────────────────────────────────────

app.get('/api/config', (req, res) => res.json(db.config));

app.put('/api/config', (req, res) => {
  const { section, data } = req.body;
  if (db.config[section]) {
    db.config[section] = { ...db.config[section], ...data };
    res.json({ success: true, config: db.config[section] });
  } else {
    res.status(400).json({ error: 'Invalid config section' });
  }
});

app.post('/api/config/test-integration', (req, res) => {
  const { service } = req.body;
  setTimeout(() => {
    res.json({
      service,
      status: Math.random() > 0.2 ? 'connected' : 'failed',
      latency: 80 + Math.floor(Math.random() * 120),
      message: `${service} integration verified successfully`
    });
  }, 500 + Math.random() * 1000);
});

// ─── WEBSOCKET SIMULATION ─────────────────────────────────────────────────────

if (io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Live metrics stream
    const metricsInterval = setInterval(() => {
      socket.emit('metrics:update', {
        latency: 80 + Math.floor(Math.random() * 80),
        tokensPerSecond: 180 + Math.floor(Math.random() * 60),
        activeSessions: 3 + Math.floor(Math.random() * 5),
        waveform: Array.from({ length: 32 }, () => Math.random()),
        queueDepth: Math.floor(Math.random() * 4),
        timestamp: Date.now()
      });
    }, 1200);

    // Transcript streaming simulation
    socket.on('meeting:start', (data) => {
      const sessionId = crypto.randomUUID();
      socket.emit('meeting:started', { sessionId });

      const speakers = ['Alexandra Chen', 'Marcus Webb', 'Sarah Kim'];
      const lines = [
        "Alright, let's get this session started. I want to make sure we cover all the critical items today.",
        "I've reviewed the metrics from last week. The numbers are looking strong — we're trending 18% above baseline.",
        "Before we proceed, I need to flag a compliance concern that came up during the audit.",
        "Can we circle back to the architecture discussion? I think there's a more efficient approach we haven't considered.",
        "The client feedback has been exceptionally positive. They specifically called out the new dashboard experience.",
        "I'm seeing some anomalies in the token efficiency data. We should investigate before the next billing cycle.",
      ];

      let lineIdx = 0;
      const transcriptInterval = setInterval(() => {
        if (lineIdx >= lines.length) {
          clearInterval(transcriptInterval);
          return;
        }
        socket.emit('transcript:chunk', {
          id: crypto.randomUUID(),
          speaker: speakers[lineIdx % speakers.length],
          text: lines[lineIdx],
          timestamp: new Date().toISOString(),
          sentiment: Math.random() > 0.3 ? 'positive' : 'neutral',
          confidence: 0.91 + Math.random() * 0.09
        });
        lineIdx++;
      }, 2500);

      socket.on('meeting:stop', () => clearInterval(transcriptInterval));
    });

    socket.on('disconnect', () => {
      clearInterval(metricsInterval);
    });
  });
}

// ─── SERVE FRONTEND ───────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🧠 Cognitive AI — Enterprise Intelligence Suite`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ${io ? 'enabled' : 'disabled'}`);
  console.log(`\nDemo credentials:`);
  console.log(`  admin@cognitev.ai / admin123`);
  console.log(`  demo@demo.com / demo\n`);
});
