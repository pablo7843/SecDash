# ── BUILD STAGE ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ── RUNTIME STAGE ─────────────────────────────────────
FROM node:20-alpine

# Usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Solo copiamos lo necesario del build stage
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY public/ ./public/
COPY package.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
