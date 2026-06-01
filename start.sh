#!/usr/bin/env bash
# SecDash — Linux/macOS Launcher
# Uso: ./start.sh
# Levanta Docker, espera que el servidor arranque y abre el navegador.

set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; GRAY='\033[0;90m'; WHITE='\033[1;37m'; NC='\033[0m'

echo ""
echo -e "${GREEN}  ╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}  ║         SECDASH  LAUNCHER  v2            ║${NC}"
echo -e "${GREEN}  ╚══════════════════════════════════════════╝${NC}"
echo ""

# Verificar .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}  [AVISO] No se encontró .env${NC}"
    echo -e "${GRAY}  Ejecuta: cp .env.example .env  y añade tus API keys${NC}"
    echo ""
fi

# Verificar Docker
if ! docker info &>/dev/null; then
    echo -e "${RED}  [ERROR] Docker no está corriendo.${NC}"
    exit 1
fi

# Build y arranque
echo -e "${CYAN}  [1/3] Construyendo imagen y levantando contenedor...${NC}"
docker compose up --build -d

# Esperar health check
echo -e "${CYAN}  [2/3] Esperando que el servidor responda...${NC}"
timeout=40
elapsed=0
ready=false

while [ "$elapsed" -lt "$timeout" ]; do
    sleep 1
    elapsed=$((elapsed + 1))
    if curl -sf http://localhost:3000/health &>/dev/null; then
        ready=true
        break
    fi
    printf "${GRAY}.${NC}"
done
echo ""

if [ "$ready" = false ]; then
    echo -e "${RED}  [ERROR] El servidor no arrancó en ${timeout}s.${NC}"
    echo -e "${GRAY}  Revisa los logs: docker compose logs secdash${NC}"
    exit 1
fi

echo -e "${GREEN}  [3/3] SecDash online — abriendo navegador...${NC}"
echo ""
echo -e "${GRAY}  ┌─────────────────────────────────────────┐${NC}"
echo -e "  │  ${WHITE}URL : http://localhost:3000${NC}             │"
echo -e "${GRAY}  │  Stop: docker compose down               │"
echo -e "${GRAY}  │  Logs: docker compose logs -f secdash    │"
echo -e "${GRAY}  └─────────────────────────────────────────┘${NC}"
echo ""

# Abrir navegador (cross-platform)
if command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v open &>/dev/null; then
    open "http://localhost:3000"
elif command -v wslview &>/dev/null; then
    wslview "http://localhost:3000"
fi
