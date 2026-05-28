const express  = require('express');
const router   = express.Router();
const vtClient = require('../clients/virustotal');

// Helper — transforma errores de Axios en respuestas claras
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
// Analiza una dirección IP
router.get('/ip/:ip', async (req, res) => {
  const { ip } = req.params;

  // Validación básica de IP
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: 'Formato de IP inválido.' });
  }

  try {
    const { data } = await vtClient.get(`/ip_addresses/${ip}`);
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

// ── GET /api/virustotal/domain/:domain ───────────────
// Analiza un dominio
router.get('/domain/:domain', async (req, res) => {
  const { domain } = req.params;

  // Limpieza básica — quitar http:// y path
  const clean = domain.replace(/^https?:\/\//,'').split('/')[0];

  if (!clean || clean.length < 3) {
    return res.status(400).json({ error: 'Dominio inválido.' });
  }

  try {
    const { data } = await vtClient.get(`/domains/${clean}`);
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

// ── POST /api/virustotal/url ──────────────────────────
// Envía una URL a escaneo y devuelve el analysis ID
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
// Consulta el resultado de un análisis (polling desde el frontend)
router.get('/analysis/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data } = await vtClient.get(`/analyses/${id}`);
    res.json(data);
  } catch (err) {
    handleVTError(err, res);
  }
});

module.exports = router;
