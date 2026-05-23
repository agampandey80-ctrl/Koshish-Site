/**
 * KOSHISH — Backend Server
 * Express entry point with ASCII art banner, CORS, routes, and error handling.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('express-async-errors');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────
//  ASCII Art Banner
// ─────────────────────────────────────────
const banner = `
\x1b[38;2;255;107;53m
 ██╗  ██╗ ██████╗ ███████╗██╗  ██╗██╗███████╗██╗  ██╗
 ██║ ██╔╝██╔═══██╗██╔════╝██║  ██║██║██╔════╝██║  ██║
 █████╔╝ ██║   ██║███████╗███████║██║███████╗███████║
 ██╔═██╗ ██║   ██║╚════██║██╔══██║██║╚════██║██╔══██║
 ██║  ██╗╚██████╔╝███████║██║  ██║██║███████║██║  ██║
 ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝
\x1b[0m
 \x1b[38;2;26;35;126m✦  Shaping Futures, One Lesson at a Time\x1b[0m
 \x1b[90m────────────────────────────────────────────\x1b[0m
`;

// ─────────────────────────────────────────
//  Middleware
// ─────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin or 'null' (from file://)
      if (!origin || origin === 'null') {
        return cb(null, true);
      }
      
      // Check if origin is in the allowed list or is a Vercel deployment
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith('.vercel.app') || 
                        /https?:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);
      
      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
//  Serve Static Frontend
// ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/events', require('./routes/events'));
app.use('/api/team', require('./routes/team'));
app.use('/api/content', require('./routes/content'));
app.use('/api/notes', require('./routes/notes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ─────────────────────────────────────────
//  Global Error Handler
// ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds the 5 MB limit.',
    });
  }

  console.error('❌  Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected server error occurred.',
  });
});

// ─────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(banner);
    console.log(`  🚀  Server running on http://localhost:${PORT}`);
    console.log(`  📦  API base path: /api/`);
    console.log('');
  });
}

module.exports = app;
