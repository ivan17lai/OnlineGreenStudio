@echo off
echo Setting up Node.js server for OnlineGreenStudio...

REM Navigate to the directory where this script is located
REM This assumes server.js is in the same directory as setup.bat
cd /d "%~dp0"

echo.
echo --- Step 1: Initializing npm project ---
call npm init -y
echo.

echo --- Step 2: Installing dependencies (express, multer, cors) ---
call npm install express multer cors
echo.
PAUSE

echo --- Step 3: Starting the server in a new window ---
start "" call node server.js
echo.

echo Server setup complete.
PAUSE