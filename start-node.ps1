# SecDash -- Node.js Launcher (sin Docker)
# Uso: .\start-node.ps1

Write-Host ""
Write-Host "  +------------------------------------------+" -ForegroundColor Green
Write-Host "  |     SECDASH LAUNCHER (Node.js)           |" -ForegroundColor Green
Write-Host "  +------------------------------------------+" -ForegroundColor Green
Write-Host ""

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "  [AVISO] No se encontro .env" -ForegroundColor Yellow
    Write-Host "  Ejecuta: cp .env.example .env  y anade tus API keys" -ForegroundColor Gray
    Write-Host ""
}

# Verificar Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor DarkGray
} catch {
    Write-Host "  [ERROR] Node.js no esta instalado." -ForegroundColor Red
    exit 1
}

# Instalar dependencias si faltan
if (-not (Test-Path "node_modules")) {
    Write-Host "  [1/3] Instalando dependencias..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "  [1/3] Dependencias OK" -ForegroundColor DarkGray
}

# Arrancar servidor en background
Write-Host "  [2/3] Arrancando servidor..." -ForegroundColor Cyan
$proc = Start-Process -FilePath "node" -ArgumentList "src/index.js" -PassThru -NoNewWindow

# Esperar health check
$timeout = 20
$elapsed = 0
$ready   = $false

while ($elapsed -lt $timeout) {
    Start-Sleep -Seconds 1
    $elapsed++
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Write-Host "  ." -NoNewline -ForegroundColor DarkGray
}
Write-Host ""

if (-not $ready) {
    Write-Host "  [ERROR] El servidor no arranco." -ForegroundColor Red
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "  [3/3] SecDash online -- abriendo navegador..." -ForegroundColor Green
Write-Host ""
Write-Host "  URL  : http://localhost:3000" -ForegroundColor White
Write-Host "  Stop : Ctrl+C en esta ventana" -ForegroundColor Gray
Write-Host ""

$url = "http://localhost:3000"
Start-Process $url

# Mantener el script vivo para ver logs (Ctrl+C para parar)
Write-Host "  Logs del servidor (Ctrl+C para detener):" -ForegroundColor DarkGray
Write-Host "  ------------------------------------------" -ForegroundColor DarkGray
Wait-Process -Id $proc.Id
