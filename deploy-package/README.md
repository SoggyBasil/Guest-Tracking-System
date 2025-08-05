# Modern Tracking System - Single Server Deployment

## 🚀 Quick Start

### Windows
```bash
# Double-click to start
start.bat

# Or run from command line
.\start.bat
```

### PowerShell
```powershell
.\start.ps1
```

### Manual Start
```bash
node dist/server.js
```

## 🌐 Access Points

- **Application**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Endpoints**: http://localhost:3001/api/*

## 📁 Package Contents

- `dist/` - Backend server files
- `public/` - Frontend application files
- `.env` - Environment configuration
- `package.json` - Dependencies
- `start.bat` - Windows startup script
- `start.ps1` - PowerShell startup script

## ⚙️ Configuration

Edit the `.env` file to configure:
- Database connection (Supabase)
- Tracking API endpoint
- Server port and environment

## 🔧 Troubleshooting

1. **Port already in use**: Change PORT in `.env` file
2. **Database connection**: Verify Supabase credentials in `.env`
3. **API errors**: Check tracking API endpoint in `.env`

## 📊 Features

- Real-time device tracking
- Guest management
- Cabin allocation
- Analytics and reporting
- Export functionality 