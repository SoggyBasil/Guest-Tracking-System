@echo off
echo ========================================
echo Yacht Tracking System - Deployment
echo ========================================

echo.
echo 1. Installing dependencies...
npm install --production

echo.
echo 2. Checking for .env file...
if not exist .env (
    echo Creating .env from template...
    copy .env.example .env
    echo Please edit .env file with your configuration
    pause
) else (
    echo .env file found
)

echo.
echo 3. Starting the server...
echo Server will be available at: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
npm start 