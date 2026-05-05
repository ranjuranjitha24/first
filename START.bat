@echo off
title HR Recruiter - Setup & Run
color 0A
echo.
echo ============================================
echo    HR Recruiter Pro - Auto Setup ^& Run
echo ============================================
echo.

REM ── Check Python ──
echo [1/5] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python from https://www.python.org/downloads
    echo Make sure to check "Add Python to PATH" during install!
    pause
    exit /b 1
)
python --version
echo Python found!

REM ── Check Node ──
echo.
echo [2/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
node --version
echo Node.js found!

REM ── Install Python packages ──
echo.
echo [3/5] Installing Python packages...
python -m pip install fastapi "uvicorn[standard]" pymongo python-dotenv "pydantic[email]" --quiet
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python packages
    pause
    exit /b 1
)
echo Python packages installed!

REM ── Install Frontend packages ──
echo.
echo [4/5] Installing Frontend packages...
cd /d "%~dp0frontend"
if not exist node_modules (
    npm install --silent
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install npm packages
        pause
        exit /b 1
    )
    echo Frontend packages installed!
) else (
    echo Frontend packages already installed!
)
cd /d "%~dp0"

REM ── Start Backend in new window ──
echo.
echo [5/5] Starting servers...
echo Starting Python Backend on http://localhost:5000 ...
start "HR Backend (Python)" cmd /k "cd /d "%~dp0backend" && python main.py"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

REM ── Start Frontend in new window ──
echo Starting React Frontend on http://localhost:5173 ...
start "HR Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM Wait 4 seconds for frontend to start
timeout /t 4 /nobreak >nul

REM ── Open browser ──
echo.
echo ============================================
echo  Both servers are running!
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ============================================
echo.
echo Opening browser...
start "" "http://localhost:5173"

echo.
echo Close the Backend and Frontend windows to stop the servers.
pause
