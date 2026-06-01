<div align="center">

# 🛡️ SecDash

### `> SECURITY_MONITOR_INITIALIZED`

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![VirusTotal](https://img.shields.io/badge/VirusTotal-394EFF?style=for-the-badge&logo=virustotal&logoColor=white)](https://www.virustotal.com/)
[![AbuseIPDB](https://img.shields.io/badge/AbuseIPDB-CC0000?style=for-the-badge&logoColor=white)](https://www.abuseipdb.com/)
[![Status](https://img.shields.io/badge/Status-Live-00FF41?style=for-the-badge)]()
[![i18n](https://img.shields.io/badge/i18n-ES%20%7C%20EN-blue?style=for-the-badge)]()

**Dashboard de threat intelligence con interfaz web. Analiza IPs, dominios, URLs y hashes de archivo contra VirusTotal (70+ motores) y AbuseIPDB en tiempo real.**

[🚀 Demo](#) · [🐛 Reportar Bug](https://github.com/pablo7843/secdash/issues)

</div>

---

## 📖 Descripción

SecDash es una herramienta de threat intelligence que actúa como proxy seguro hacia las APIs de VirusTotal y AbuseIPDB. Las API keys viven exclusivamente en el backend (variables de entorno), nunca se exponen al cliente. El propio servidor Express sirve el frontend, por lo que basta con abrir `http://localhost:3000` — sin Live Server ni abrir ficheros manualmente.

---

## ✨ Características

### Análisis
- **IP** — VirusTotal (70+ motores) + AbuseIPDB: score de abuso, historial, detección de nodos Tor, ISP, red, RIR
- **Dominio** — Registrador, fechas WHOIS, categorías, tags, reputación y detecciones por motor
- **URL** — Envío y polling de resultados en tiempo real contra VirusTotal
- **Hash de archivo** ★ — Análisis de ficheros por MD5, SHA-1 o SHA-256: tipo, magic bytes, tamaño, todos los hashes con botón copiar, primera vez visto, nombres detectados
- **Bulk IP scan** ★ — Escanea hasta 10 IPs a la vez; tabla de resultados en tiempo real con barra de progreso

### Inteligencia
- **Combined Threat Score** ★ — Puntuación 0-100 que combina VirusTotal y AbuseIPDB en un único indicador visual con barra animada y código de color (verde / amarillo / rojo)
- **Detecciones por motor** — Tabla con nombre del motor, resultado y categoría; muestra hasta 25 detecciones positivas
- **Historial persistente** — Últimos 50 análisis en localStorage, filtrables por tipo y veredicto

### UX / UI
- **Auto-apertura** ★ — El script de lanzamiento levanta Docker (o Node.js) y abre el navegador automáticamente
- **Bilingüe ES / EN** ★ — Toggle en el header; idioma persistido en localStorage
- **Health check en vivo** ★ — Los badges del header (`ONLINE · VT · ABUSE`) consultan `/health` cada 30 s
- **Toasts** ★ — Notificaciones emergentes en la esquina superior derecha para cada acción
- **Export JSON** ★ — Descarga los datos crudos de cualquier resultado
- **Copiar al portapapeles** ★ — Botón ⎘ en IPs, dominios, URLs y todos los hashes
- **Atajos de teclado** ★ — `Ctrl+1…6` para cambiar de tab, `Enter` para escanear
- **Filtros de historial** ★ — Por tipo (IP / Dominio / URL / Hash) y veredicto
- **Rate limiting** — 60 req / 15 min por IP para proteger los límites de las APIs
- **Cache in-memory** ★ — TTL de 5 min en todas las rutas; evita peticiones redundantes a las APIs

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js 20 + Express |
| **HTTP Client** | Axios |
| **Seguridad** | express-rate-limit · CORS · usuario no-root en Docker |
| **Cache** | In-memory Map con TTL (sin dependencias extra) |
| **Frontend** | HTML + CSS + JS vanilla · i18n propio |
| **Deploy** | Docker (multistage) · docker-compose · Koyeb |
| **APIs** | VirusTotal v3 · AbuseIPDB v2 |

---

## 🏗️ Arquitectura

```
Browser → http://localhost:3000
              │
              │  GET /          → sirve public/index.html
              │  fetch('/api/…') → proxy seguro a las APIs
              ▼
┌──────────────────────────────────────┐
│           Express Backend            │
│                                      │
│  Static → public/index.html         │
│                                      │
│  /api/virustotal/ip/:ip      ──────► VirusTotal API
│  /api/virustotal/domain/:d   ──────► VirusTotal API
│  /api/virustotal/url         ──────► VirusTotal API
│  /api/virustotal/analysis/:id──────► VirusTotal API
│  /api/virustotal/hash/:hash  ──────► VirusTotal API  ★
│  /api/abuseipdb/check/:ip    ──────► AbuseIPDB API
│                                      │
│  Cache in-memory (5 min TTL)  ★     │
│  Rate Limiter (60 req / 15 min)      │
│  CORS · API Keys en env vars         │
└──────────────────────────────────────┘
```

---

## 🚀 Inicio rápido

### Prerrequisitos
- Node.js 18+ **o** Docker
- API keys gratuitas de [VirusTotal](https://www.virustotal.com/gui/join-us) y [AbuseIPDB](https://www.abuseipdb.com/register)

### 1 · Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env y añade tus API keys
```

### 2a · Con Node.js (sin Docker)

```powershell
# Windows — abre el servidor y el navegador automáticamente
.\start-node.ps1
```

```bash
# Linux / macOS
npm install && npm start
# Abre http://localhost:3000
```

### 2b · Con Docker

```powershell
# Windows — build, arranque y apertura de navegador en un comando
.\start.ps1
```

```bash
# Linux / macOS
./start.sh
```

```bash
# Manual
docker compose up --build -d
# Abre http://localhost:3000
```

> **Nota:** Ya no hace falta abrir ningún fichero `.html` manualmente. Express sirve el frontend directamente en `http://localhost:3000`.

---

## 🐳 Docker (manual)

```bash
# Build
docker build -t secdash .

# Run
docker run -p 3000:3000 \
  -e VIRUSTOTAL_API_KEY=tu_key \
  -e ABUSEIPDB_API_KEY=tu_key \
  secdash

# Con docker-compose (recomendado — lee .env automáticamente)
docker compose up --build -d

# Parar
docker compose down

# Logs
docker compose logs -f secdash
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
   - `ALLOWED_ORIGIN` = URL de tu servicio en Koyeb
6. Deploy → en 2 minutos está online 24/7

El frontend se sirve desde el propio backend, así que `API_BASE = '/api'` funciona en cualquier entorno sin cambios.

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del servidor y configuración de keys |
| `GET` | `/api/virustotal/ip/:ip` | Analiza una IP (IPv4 o IPv6) |
| `GET` | `/api/virustotal/domain/:domain` | Analiza un dominio |
| `POST` | `/api/virustotal/url` | Envía URL a escaneo |
| `GET` | `/api/virustotal/analysis/:id` | Resultado de un análisis (polling) |
| `GET` | `/api/virustotal/hash/:hash` | Analiza un fichero por MD5 / SHA-1 / SHA-256 ★ |
| `GET` | `/api/abuseipdb/check/:ip` | Reputación de IP (solo IPv4) |

Todas las rutas de consulta (ip, domain, hash, abuseipdb) tienen **cache in-memory de 5 minutos**.

---

## 📂 Estructura del Proyecto

```
secdash/
├── public/
│   └── index.html          # Frontend completo (i18n ES/EN, 6 tabs)
├── src/
│   ├── index.js            # Servidor Express + static serving
│   ├── clients/
│   │   ├── virustotal.js   # Cliente Axios — VirusTotal
│   │   └── abuseipdb.js    # Cliente Axios — AbuseIPDB
│   ├── routes/
│   │   ├── virustotal.js   # Rutas /api/virustotal/* (incl. /hash)
│   │   └── abuseipdb.js    # Rutas /api/abuseipdb/*
│   └── utils/
│       └── cache.js        # Cache in-memory con TTL  ★
├── .env                    # API keys (no incluir en git)
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── Dockerfile              # Build multistage, usuario no-root
├── docker-compose.yml      # Orquestación con env_file  ★
├── start.ps1               # Lanzador Windows (Docker)  ★
├── start-node.ps1          # Lanzador Windows (Node.js) ★
├── start.sh                # Lanzador Linux/macOS        ★
└── package.json
```

---

## ⌨️ Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + 1` | Tab IP |
| `Ctrl + 2` | Tab Dominio |
| `Ctrl + 3` | Tab URL |
| `Ctrl + 4` | Tab Hash |
| `Ctrl + 5` | Tab Bulk Scan |
| `Ctrl + 6` | Tab Historial |
| `Enter` | Lanzar escaneo en el tab activo |

---

## 👤 Autor

**Pablo Climent**

[![Portfolio](https://img.shields.io/badge/Portfolio-0d1117?style=flat-square&logo=vercel&logoColor=00ff41)](https://portfolio-pablo-five.vercel.app/es/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pabloclimentsanfelix)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/pablo7843)

---

<div align="center">

`THREAT_INTEL: ACTIVE` · `APIS: VT + ABUSEIPDB` · `i18n: ES | EN` · `DEPLOY: KOYEB`

</div>
