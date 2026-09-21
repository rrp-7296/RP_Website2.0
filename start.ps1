# Website 2.0 — Start Both Servers (PHP Backend + React/Vite Frontend)
# Run with: .\start.ps1
# Or right-click → "Run with PowerShell"

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Banner {
    Write-Host ""
    Write-Host "  ============================================================" -ForegroundColor Cyan
    Write-Host "   Rakeshwar Pandey Portfolio — Website 2.0" -ForegroundColor White
    Write-Host "   Starting Development Servers (PHP Backend + React Frontend)..." -ForegroundColor White
    Write-Host "  ============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Status($msg, $color = "Green") {
    Write-Host "  $msg" -ForegroundColor $color
}

Write-Banner

# ── Validate Prerequisites ─────────────────────────────────────────────────
$phpBin = "php"
if (Test-Path "C:\xampp\php\php.exe") {
    $phpBin = "C:\xampp\php\php.exe"
}

$backendApi = Join-Path $Root "backend-php\api\index.php"
$nodeModules = Join-Path $Root "ui\node_modules"

if (-not (Test-Path $backendApi)) {
    Write-Status "[ERROR] PHP backend script not found: backend-php\api\index.php" "Red"
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path $nodeModules)) {
    Write-Status "[ERROR] Node modules not found: ui\node_modules\" "Red"
    Write-Status "        Fix: cd ui && npm install" "Yellow"
    Read-Host "Press Enter to exit"
    exit 1
}

# ── Start Backend ──────────────────────────────────────────────────────────
Write-Status "[1/2] Starting PHP Backend → http://localhost:8000" "Yellow"
Write-Status "      Health Check: http://localhost:8000/health" "DarkGray"
Write-Host ""

$backendDir = Join-Path $Root "backend-php\api"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& { `$Host.UI.RawUI.WindowTitle = 'Backend - PHP :8000'; Set-Location '$backendDir'; & '$phpBin' -S 127.0.0.1:8000 -t '$backendDir' '$backendApi' }"
)

# Slight delay to let backend initialize first
Start-Sleep -Seconds 2

# ── Start Frontend ─────────────────────────────────────────────────────────
Write-Status "[2/2] Starting Frontend (Vite + React) → http://localhost:5173" "Yellow"
Write-Host ""

$frontendDir = Join-Path $Root "ui"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& { `$Host.UI.RawUI.WindowTitle = 'Frontend - Vite'; Set-Location '$frontendDir'; npm run dev }"
)

# Wait for Vite to boot
Start-Sleep -Seconds 3

# ── Print Summary ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host "   ✅  Both servers are running!" -ForegroundColor Green
Write-Host ""
Write-Host "   🌐  Frontend  →  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "   🔌  Backend   →  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host "   📖  Health    →  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Close the server windows to stop the servers." -ForegroundColor DarkGray
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host ""

# Open browser
Start-Process "http://localhost:5173"
