Write-Host "🚀 Starting Modern Tracking System" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "🌐 Starting server on http://localhost:3001" -ForegroundColor Yellow
Write-Host "📊 Health check: http://localhost:3001/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node dist/server.js

Write-Host ""
Write-Host "🛑 Server stopped." -ForegroundColor Green
Read-Host "Press Enter to continue" 