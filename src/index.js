require('dotenv').config();
const path       = require('path');
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const vtRouter    = require('./routes/virustotal');
const abuseRouter = require('./routes/abuseipdb');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────

app.use(express.json());

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));

// Rate limiting — 60 requests por IP cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Espera unos minutos.' },
});

app.use('/api/', limiter);

// ── API ROUTES ────────────────────────────────────────

app.use('/api/virustotal', vtRouter);
app.use('/api/abuseipdb',  abuseRouter);

// Health check — compatible con Docker y Koyeb
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      virustotal: !!process.env.VIRUSTOTAL_API_KEY,
      abuseipdb:  !!process.env.ABUSEIPDB_API_KEY,
    },
  });
});

// ── STATIC FRONTEND ───────────────────────────────────
// El backend sirve el frontend — abre http://localhost:3000 directamente

app.use(express.static(path.join(__dirname, '../public')));

// Catch-all: devuelve index.html para cualquier ruta no-API
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// ── ERROR HANDLER ─────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// ── START ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║           SECDASH BACKEND — ONLINE           ║
╠══════════════════════════════════════════════╣
║  URL      : http://localhost:${PORT}              ║
║  VT Key   : ${process.env.VIRUSTOTAL_API_KEY ? '✔ configurada               ║' : '✘ FALTA — añádela al .env  ║'}
║  Abuse Key: ${process.env.ABUSEIPDB_API_KEY  ? '✔ configurada               ║' : '✘ FALTA — añádela al .env  ║'}
╚══════════════════════════════════════════════╝`);
});
