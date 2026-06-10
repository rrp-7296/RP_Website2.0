# Website 2.0 — Start Both Servers
# Run with: .\start.ps1
# Or right-click → "Run with PowerShell"

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Banner {
    Write-Host ""
    Write-Host "  ============================================================" -ForegroundColor Cyan
    Write-Host "   Rakeshwar Pandey Portfolio — Website 2.0" -ForegroundColor White
    Write-Host "   Starting Development Servers..." -ForegroundColor White
    Write-Host "  ============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Status($msg, $color = "Green") {
    Write-Host "  $msg" -ForegroundColor $color
}

Write-Banner

# ── Validate Prerequisites ─────────────────────────────────────────────────
$venvPython = Join-Path $Root "backend\venv\Scripts\python.exe"
$nodeModules = Join-Path $Root "ui\node_modules"

if (-not (Test-Path $venvPython)) {
    Write-Status "[ERROR] Virtual environment not found: backend\venv\" "Red"
    Write-Status "        Fix: cd backend && python -m venv venv && venv\Scripts\pip install -r requirements.txt" "Yellow"
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
Write-Status "[1/2] Starting Backend  (FastAPI + Uvicorn) → http://localhost:8000" "Yellow"
Write-Status "      API Docs: http://localhost:8000/api/docs" "DarkGray"
Write-Host ""

$backendDir = Join-Path $Root "backend"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& { `$Host.UI.RawUI.WindowTitle = 'Backend - FastAPI :8000'; Set-Location '$backendDir'; & '$venvPython' run.py }"
)

# Slight delay to let backend initialize first
Start-Sleep -Seconds 2

# ── Start Frontend ─────────────────────────────────────────────────────────
Write-Status "[2/2] Starting Frontend (Vite + React)    → http://localhost:5173" "Yellow"
Write-Host ""

$frontendDir = Join-Path $Root "ui"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& { `$Host.UI.RawUI.WindowTitle = 'Frontend - Vite :5173'; Set-Location '$frontendDir'; npm run dev }"
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
Write-Host "   📖  API Docs  →  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Close the server windows to stop the servers." -ForegroundColor DarkGray
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host ""

# Open browser
Start-Process "http://localhost:5173"
