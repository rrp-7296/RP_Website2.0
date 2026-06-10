@echo off
title Website 2.0 - Dev Servers
color 0A

echo.
echo  ============================================================
echo   Rakeshwar Pandey Portfolio - Website 2.0
echo   Starting Development Servers...
echo  ============================================================
echo.

:: Check if venv exists
if not exist "%~dp0backend\venv\Scripts\python.exe" (
    echo  [ERROR] Virtual environment not found at backend\venv\
    echo  Please run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "%~dp0ui\node_modules" (
    echo  [ERROR] Node modules not found at ui\node_modules\
    echo  Please run: cd ui ^&^& npm install
    pause
    exit /b 1
)

echo  [1/2] Starting Backend  (FastAPI + Uvicorn) on http://localhost:8000
echo        API Docs: http://localhost:8000/api/docs
echo.
start "Backend - FastAPI :8000" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe run.py"

:: Small delay so backend starts first
timeout /t 2 /nobreak >nul

echo  [2/2] Starting Frontend (Vite + React)    on http://localhost:5173
echo.
start "Frontend - Vite :5173" cmd /k "cd /d %~dp0ui && npm run dev"

:: Wait for Vite to be ready
timeout /t 3 /nobreak >nul

echo.
echo  ============================================================
echo   Both servers are starting in separate windows!
echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/api/docs
echo.
echo   Close the server windows to stop the servers.
echo  ============================================================
echo.

:: Open browser automatically
timeout /t 2 /nobreak >nul
start http://localhost:5173

pause
