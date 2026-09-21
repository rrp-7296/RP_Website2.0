@echo off
title Website 2.0 - Dev Servers (PHP + React)
color 0A

echo.
echo  ============================================================
echo   Rakeshwar Pandey Portfolio - Website 2.0
echo   Starting Development Servers (PHP Backend + React Frontend)...
echo  ============================================================
echo.

:: Detect PHP executable (XAMPP or System PATH)
set "PHP_BIN=php"
if exist "C:\xampp\php\php.exe" (
    set "PHP_BIN=C:\xampp\php\php.exe"
)

:: Check if PHP directory exists
if not exist "%~dp0backend-php\api\index.php" (
    echo  [ERROR] PHP backend not found at backend-php\api\index.php
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

echo  [1/2] Starting PHP Backend on http://localhost:8000
echo.
start "Backend - PHP :8000" cmd /k "cd /d %~dp0backend-php\api && "%PHP_BIN%" -S 127.0.0.1:8000 -t "%~dp0backend-php\api" "%~dp0backend-php\api\index.php""

:: Small delay so backend starts first
timeout /t 2 /nobreak >nul

echo  [2/2] Starting Frontend (Vite + React)...
echo.
start "Frontend - Vite" cmd /k "cd /d %~dp0ui && npm run dev"

:: Wait for Vite to be ready
timeout /t 3 /nobreak >nul

echo.
echo  ============================================================
echo   Both servers are starting in separate windows!
echo.
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   Health   : http://localhost:8000/health
echo.
echo   Close the server windows to stop the servers.
echo  ============================================================
echo.

:: Open browser automatically
timeout /t 2 /nobreak >nul
start http://localhost:5173

pause
