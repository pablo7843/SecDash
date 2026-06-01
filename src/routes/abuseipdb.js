const express     = require('express');
const router      = express.Router();
const abuseClient = require('../clients/abuseipdb');
const cache       = require('../utils/cache');

function handleAbuseError(err, res) {
  if (err.response) {
    const status = err.response.status;
    if (status === 401) return res.status(401).json({ error: 'API key de AbuseIPDB inválida.' });
    if (status === 422) return res.status(422).json({ error: 'IP inválida o no analizable.' });
    if (status === 429) return res.status(429).json({ error: 'Límite de AbuseIPDB alcanzado.' });
    return res.status(status).json({ error: `AbuseIPDB error: ${err.response.statusText}` });
  }
  if (err.code === 'ECONNABORTED') return res.status(504).json({ error: 'Timeout conectando con AbuseIPDB.' });
  return res.status(500).json({ error: 'Error inesperado.' });
}

// ── GET /api/abuseipdb/check/:ip ─────────────────────
router.get('/check/:ip', async (req, res) => {
  const { ip } = req.params;

  const ipv4Re = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Re.test(ip)) {
    return res.status(400).json({ error: 'Formato de IP inválido (solo IPv4 soportado por AbuseIPDB).' });
  }

  const key = `abuse:ip:${ip}`;
  const cached = cache.get(key);
  if (cached) return res.json(cached);

  try {
    const { data } = await abuseClient.get('/check', {
      params: { ipAddress: ip, maxAgeInDays: 90, verbose: true },
    });
    cache.set(key, data);
    res.json(data);
  } catch (err) {
    handleAbuseError(err, res);
  }
});

module.exports = router;
