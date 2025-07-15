const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const matchRoutes = require('./routes/match');
const talentRoutes = require('./routes/talent');
const gigsRoutes = require('./routes/gigs');
const matchHistoryRoutes = require('./routes/match-history');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use(limiter);

// Allow only the deployed frontend
const allowedOrigins = [
  'https://talent-sync011.vercel.app', 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

let talentProfiles = [];
let dataLoadTime = null;

// Load talent profiles on startup
function loadTalentProfiles() {
  try {
    const filePath = path.join(__dirname, 'data', 'TalentProfiles.json');

    if (!fs.existsSync(filePath)) {
      console.error('TalentProfiles.json not found in /data directory');
      process.exit(1);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    talentProfiles = JSON.parse(data);
    dataLoadTime = new Date().toISOString();

    validateDataStructure();
  } catch (error) {
    console.error('Error loading TalentProfiles.json:', error.message);
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON format in TalentProfiles.json');
    }
    process.exit(1);
  }
}

// Validate profile structure
function validateDataStructure() {
  if (!Array.isArray(talentProfiles) || talentProfiles.length === 0) {
    throw new Error('TalentProfiles.json must contain a non-empty array');
  }

  const sampleProfile = talentProfiles[0];
  const requiredFields = ['id', 'name', 'city', 'skills', 'style_tags', 'budget_range'];
  const missingFields = requiredFields.filter(field => !(field in sampleProfile));

  if (missingFields.length > 0) {
    console.warn(`Missing fields in sample profile: ${missingFields.join(', ')}`);
  }
}

// Load data and share globally
loadTalentProfiles();
app.set('talentProfiles', talentProfiles);
app.set('dataLoadTime', dataLoadTime);

// Routes
app.use('/api/match', matchRoutes);
app.use('/api/talents', talentRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/match-history', matchHistoryRoutes);
app.use('/api/stats', statsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BreadButter Talent Matchmaker API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      match: '/api/match',
      talents: '/api/talents',
      health: '/health'
    },
    documentation: 'https://github.com/your-repo/breadbutter-backend'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BreadButter Matchmaking API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    profilesLoaded: talentProfiles.length,
    dataLoadTime,
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API overview
app.get('/api', (req, res) => {
  res.json({
    api: 'BreadButter Talent Matchmaker',
    version: '1.0.0',
    endpoints: {
      'POST /api/match': 'Find matching talents',
      'GET /api/talents': 'Get all talent profiles',
      'GET /api/talents/:id': 'Get specific talent profile',
      'GET /api/talents/stats': 'Get talent statistics',
      'GET /health': 'Health check endpoint'
    },
    totalTalents: talentProfiles.length,
    dataLastLoaded: dataLoadTime
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api',
      'POST /api/match',
      'GET /api/talents'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      message: 'Please check your JSON format'
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down.');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down.');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
