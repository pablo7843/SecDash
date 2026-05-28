const axios = require('axios');

const vtClient = axios.create({
  baseURL: 'https://www.virustotal.com/api/v3',
  timeout: 20000,
  headers: {
    'x-apikey': process.env.VIRUSTOTAL_API_KEY,
    'Accept': 'application/json',
  },
});

module.exports = vtClient;
