require('dotenv').config();
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

// ── ROUTES ────────────────────────────────────────────

app.use('/api/virustotal', vtRouter);
app.use('/api/abuseipdb',  abuseRouter);

// Health check — Koyeb lo usa para saber si el servicio está vivo
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

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// Error handler global
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// ── START ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║       SECDASH BACKEND — ONLINE       ║
╠══════════════════════════════════════╣
║  Port     : ${PORT}                      
║  VT Key   : ${process.env.VIRUSTOTAL_API_KEY ? '✔ configurada' : '✘ falta'}           
║  Abuse Key: ${process.env.ABUSEIPDB_API_KEY  ? '✔ configurada' : '✘ falta'}           
╚══════════════════════════════════════╝`);
});
