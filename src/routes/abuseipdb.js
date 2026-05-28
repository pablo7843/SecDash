const express     = require('express');
const router      = express.Router();
const abuseClient = require('../clients/abuseipdb');

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
// Comprueba la reputación de una IP
router.get('/check/:ip', async (req, res) => {
  const { ip } = req.params;

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: 'Formato de IP inválido.' });
  }

  try {
    const { data } = await abuseClient.get('/check', {
      params: {
        ipAddress:     ip,
        maxAgeInDays:  90,
        verbose:       true,
      },
    });
    res.json(data);
  } catch (err) {
    handleAbuseError(err, res);
  }
});

module.exports = router;
