# SecDash -- Windows Launcher
# Uso: .\start.ps1
# Levanta Docker, espera que el servidor arranque y abre el navegador.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  +------------------------------------------+" -ForegroundColor Green
Write-Host "  |        SECDASH LAUNCHER v2               |" -ForegroundColor Green
Write-Host "  +------------------------------------------+" -ForegroundColor Green
Write-Host ""

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "  [AVISO] No se encontro .env" -ForegroundColor Yellow
    Write-Host "  Ejecuta: cp .env.example .env  y anade tus API keys" -ForegroundColor Gray
    Write-Host ""
}

# Verificar Docker
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Docker no responde" }
} catch {
    Write-Host "  [ERROR] Docker Desktop no esta corriendo. Arrancalo primero." -ForegroundColor Red
    exit 1
}

# Build y arranque
Write-Host "  [1/3] Construyendo imagen y levantando contenedor..." -ForegroundColor Cyan
docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Fallo en docker compose up" -ForegroundColor Red
    exit 1
}

# Esperar health check
Write-Host "  [2/3] Esperando que el servidor responda..." -ForegroundColor Cyan
$timeout = 40
$elapsed = 0
$ready   = $false

while ($elapsed -lt $timeout) {
    Start-Sleep -Seconds 1
    $elapsed++
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Write-Host "  ." -NoNewline -ForegroundColor DarkGray
}
Write-Host ""

if (-not $ready) {
    Write-Host "  [ERROR] El servidor no arranco en $timeout segundos." -ForegroundColor Red
    Write-Host "  Revisa los logs: docker compose logs secdash" -ForegroundColor Gray
    exit 1
}

Write-Host "  [3/3] SecDash online -- abriendo navegador..." -ForegroundColor Green
Write-Host ""
Write-Host "  URL  : http://localhost:3000" -ForegroundColor White
Write-Host "  Stop : docker compose down" -ForegroundColor Gray
Write-Host "  Logs : docker compose logs -f secdash" -ForegroundColor Gray
Write-Host ""

$url = "http://localhost:3000"
Start-Process $url
