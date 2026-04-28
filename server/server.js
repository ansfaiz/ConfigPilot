require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const db = require('./config/db');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

function parseCorsOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const allowedOrigins = new Set([
  ...parseCorsOrigins(process.env.CORS_ORIGINS),
  // Dev-safe defaults (keeps local working even if env not set)
  'http://localhost:5173',
  'http://localhost:3000',
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl/health checks) with no Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Gracefully handle invalid JSON bodies (prevents crashes)
app.use(
  express.json({
    limit: '1mb',
    strict: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/records', dataRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Central error handler (safe responses)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Invalid JSON
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // CORS rejection
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: origin not allowed' });
  }

  const status = Number(err.statusCode || err.status) || 500;
  const safeMessage = status >= 500 ? 'Server error' : err.message || 'Request failed';
  if (status >= 500) console.error('Unhandled error:', err);
  return res.status(status).json({ error: safeMessage });
});

async function init() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      module VARCHAR(100) NOT NULL,
      data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Tables ready');

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API listening on :${port}`));
}

init().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
