@echo off
echo 🚀 Starting Modern Tracking System
echo =================================
echo.

cd /d "%~dp0"

echo 🌐 Starting server on http://localhost:3001
echo 📊 Health check: http://localhost:3001/health
echo.
echo Press Ctrl+C to stop the server
echo.

node dist/server.js

echo.
echo 🛑 Server stopped.
pause 