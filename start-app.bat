@echo off
echo Starting FitScan Fitness App Local Preview...
echo.
echo This will run the app with placeholder data for UI preview only.
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js first:
    echo https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to project directory
cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies. Trying with bun...
        bun install
    )
)

REM Start development server
echo.
echo Starting development server...
echo The app will open at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev