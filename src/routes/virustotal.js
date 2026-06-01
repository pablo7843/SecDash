const express  = require('express');
const router   = express.Router();
const vtClient = require('../clients/virustotal');
const cache    = require('../utils/cache');

function handleVTError(err, res) {
  if (err.response) {
    const status = err.response.status;
    if (status === 401) return res.status(401).json({ error: 'API key de VirusTotal inválida.' });
    if (status === 404) return res.status(404).json({ error: 'Recurso no encontrado en VirusTotal.' });
    if (status === 429) return res.status(429).json({ error: 'Límite de la API de VirusTotal alcanzado. Espera 1 minuto.' });
    return res.status(status).json({ error: `VirusTotal error: ${err.response.statusText}` });
  }
  if (err.code === 'ECONNABORTED') return res.status(504).json({ error: 'Timeout conectando con VirusTotal.' });
  return res.status(500).json({ error: 'Error inesperado.' });
}

// ── GET /api/virustotal/ip/:ip ────────────────────────
router.get('/ip/:ip', async (req, res) => {
  const { ip } = req.params;

  const ipv4Re = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Re = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (!ipv4Re.test(ip) && !ipv6Re.test(ip)) {
    return res.status(400).json({ error: 'Formato de IP inválido (IPv4 o IPv6).' });
  }

  const key = `vt:ip:${ip}`;
  const cached = cache.get(key);
  if (cached) return res.json(cached);

  try {
    const { data } = await vtClient.get(`/ip_addresses/${ip}`);
    cache.set(key, data);
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

// ── GET /api/virustotal/domain/:domain ───────────────
router.get('/domain/:domain', async (req, res) => {
  const { domain } = req.params;
  const clean = domain.replace(/^https?:\/\//,'').split('/')[0];

  if (!clean || clean.length < 3) {
    return res.status(400).json({ error: 'Dominio inválido.' });
  }

  const key = `vt:domain:${clean}`;
  const cached = cache.get(key);
  if (cached) return res.json(cached);

  try {
    const { data } = await vtClient.get(`/domains/${clean}`);
    cache.set(key, data);
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

// ── POST /api/virustotal/url ──────────────────────────
router.post('/url', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL no proporcionada.' });
  }

  try {
    const params = new URLSearchParams({ url });
    const { data } = await vtClient.post('/urls', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

// ── GET /api/virustotal/analysis/:id ─────────────────
router.get('/analysis/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await vtClient.get(`/analyses/${id}`);
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

// ── GET /api/virustotal/hash/:hash ───────────────────
// Analiza un fichero por MD5 (32), SHA-1 (40) o SHA-256 (64) hex
router.get('/hash/:hash', async (req, res) => {
  const { hash } = req.params;
  const validHash = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/.test(hash);
  if (!validHash) {
    return res.status(400).json({ error: 'Hash inválido. Use MD5 (32), SHA-1 (40) o SHA-256 (64) caracteres hex.' });
  }

  const key = `vt:hash:${hash.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return res.json(cached);

  try {
    const { data } = await vtClient.get(`/files/${hash}`);
    cache.set(key, data);
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

module.exports = router;
