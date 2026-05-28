const axios = require('axios');

const abuseClient = axios.create({
  baseURL: 'https://api.abuseipdb.com/api/v2',
  timeout: 10000,
  headers: {
    'Key': process.env.ABUSEIPDB_API_KEY,
    'Accept': 'application/json',
  },
});

module.exports = abuseClient;
