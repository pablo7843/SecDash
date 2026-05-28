<div align="center">

# 🛡️ SecDash

### `> SECURITY_MONITOR_INITIALIZED`

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![VirusTotal](https://img.shields.io/badge/VirusTotal-394EFF?style=for-the-badge&logo=virustotal&logoColor=white)](https://www.virustotal.com/)
[![AbuseIPDB](https://img.shields.io/badge/AbuseIPDB-CC0000?style=for-the-badge&logoColor=white)](https://www.abuseipdb.com/)
[![Status](https://img.shields.io/badge/Status-Live-00FF41?style=for-the-badge)]()

**Dashboard de monitorización de seguridad. Analiza IPs, dominios y URLs contra VirusTotal (70+ motores) y AbuseIPDB en tiempo real.**

[🚀 Demo](#) · [🐛 Reportar Bug](https://github.com/pablo7843/secdash/issues)

</div>

---

## 📖 Descripción

SecDash es una herramienta de threat intelligence con interfaz web que actúa como proxy seguro hacia las APIs de VirusTotal y AbuseIPDB. Las API keys se guardan en el backend (variables de entorno), nunca se exponen al cliente.

---

## ✨ Características

- **Análisis de IP** — VirusTotal (70+ motores) + AbuseIPDB (score de abuso, historial, detección de nodos Tor)
- **Análisis de dominio** — Registrador, fechas, categorías, reputación y detecciones
- **Análisis de URL** — Escaneo en tiempo real con polling de resultados
- **Historial persistente** — Últimos 50 análisis guardados en localStorage
- **Rate limiting** — 60 req / 15 min por IP para proteger los límites de las APIs
- **Health check** — Endpoint `/health` compatible con Koyeb y Docker

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js + Express |
| **HTTP Client** | Axios |
| **Seguridad** | express-rate-limit + CORS |
| **Frontend** | HTML + CSS + JS vanilla |
| **Deploy** | Docker + Koyeb |
| **APIs** | VirusTotal v3 · AbuseIPDB v2 |

---

## 🏗️ Arquitectura

```
Browser (index.html)
       │
       │  fetch('/api/...')
       ▼
┌─────────────────────────┐
│   Express Backend       │
│                         │
│  /api/virustotal/ip     │──► VirusTotal API
│  /api/virustotal/domain │──► VirusTotal API
│  /api/virustotal/url    │──► VirusTotal API
│  /api/abuseipdb/check   │──► AbuseIPDB API
│                         │
│  Rate Limiter (60/15m)  │
│  CORS                   │
│  API Keys (env vars)    │
└─────────────────────────┘
```

---

## 🚀 Instalación local

### Prerrequisitos
- Node.js 18+
- API keys gratuitas de [VirusTotal](https://www.virustotal.com/gui/join-us) y [AbuseIPDB](https://www.abuseipdb.com/register)

```bash
# 1. Clonar
git clone https://github.com/pablo7843/secdash.git
cd secdash

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus API keys

# 4. Lanzar en desarrollo
npm run dev
```

Abre `public/index.html` en el navegador (o sirve la carpeta `public/` con Live Server).

---

## 🐳 Docker

```bash
# Build
docker build -t secdash .

# Run
docker run -p 3000:3000 \
  -e VIRUSTOTAL_API_KEY=tu_key \
  -e ABUSEIPDB_API_KEY=tu_key \
  secdash
```

---

## ☁️ Deploy en Koyeb (gratuito, 24/7)

1. Haz push del repo a GitHub
2. Ve a [koyeb.com](https://www.koyeb.com) y crea una cuenta
3. **New Service → GitHub → selecciona este repo**
4. Koyeb detecta el `Dockerfile` automáticamente
5. En **Environment Variables** añade:
   - `VIRUSTOTAL_API_KEY` = tu key
   - `ABUSEIPDB_API_KEY` = tu key
   - `ALLOWED_ORIGIN` = URL de tu frontend
6. Deploy → en 2 minutos está online 24/7

Una vez desplegado, actualiza la variable `API_BASE` en `public/index.html`:
```js
const API_BASE = 'https://tu-app.koyeb.app/api';
```

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servidor |
| `GET` | `/api/virustotal/ip/:ip` | Analiza una IP |
| `GET` | `/api/virustotal/domain/:domain` | Analiza un dominio |
| `POST` | `/api/virustotal/url` | Envía URL a escaneo |
| `GET` | `/api/virustotal/analysis/:id` | Resultado del análisis |
| `GET` | `/api/abuseipdb/check/:ip` | Reputación de IP |

---

## 📂 Estructura del Proyecto

```
secdash/
├── public/
│   └── index.html          # Frontend (UI completa)
├── src/
│   ├── index.js            # Servidor Express principal
│   ├── clients/
│   │   ├── virustotal.js   # Cliente Axios — VirusTotal
│   │   └── abuseipdb.js    # Cliente Axios — AbuseIPDB
│   └── routes/
│       ├── virustotal.js   # Rutas /api/virustotal/*
│       └── abuseipdb.js    # Rutas /api/abuseipdb/*
├── .env.example
├── .gitignore
├── Dockerfile
└── package.json
```

---

## 👤 Autor

**Pablo Climent**

[![Portfolio](https://img.shields.io/badge/Portfolio-0d1117?style=flat-square&logo=vercel&logoColor=00ff41)](https://portfolio-pablo-five.vercel.app/es/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pabloclimentsanfelix)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/pablo7843)

---

<div align="center">

`THREAT_INTEL: ACTIVE` · `APIS: VT + ABUSEIPDB` · `DEPLOY: KOYEB`

</div>
