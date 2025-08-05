# Modern Tracking System

A simple, single-server yacht tracking system with real-time device tracking and guest management.

## 🚀 Quick Start

### Option 1: Use the Deployment Package (Recommended)
```bash
cd deploy-package
.\start.bat
```

### Option 2: Manual Start
```bash
cd deploy-package
node dist/server.js
```

## 🌐 Access

- **Application**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API**: http://localhost:3001/api/*

## 📁 Project Structure

```
modern-tracking-system/
├── deploy-package/          # Ready-to-run deployment package
│   ├── dist/               # Backend server files
│   ├── public/             # Frontend application files
│   ├── .env                # Environment configuration
│   ├── start.bat           # Windows startup script
│   ├── start.ps1           # PowerShell startup script
│   └── README.md           # Deployment instructions
├── backend/                # Backend source code (for development)
├── frontend/               # Frontend source code (for development)
└── README.md               # This file
```

## ⚙️ Configuration

Edit `deploy-package/.env` to configure:
- Database connection (Supabase)
- Tracking API endpoint
- Server port and environment

## 🔧 Development

For development work, you can still use the separate backend and frontend folders:

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 📊 Features

- Real-time device tracking
- Guest management and cabin allocation
- Analytics and reporting
- Export functionality
- Responsive web interface

## 🎯 Single Server Benefits

- **Simple deployment**: One command to start everything
- **No port conflicts**: Everything runs on port 3001
- **Easy maintenance**: Single server to manage
- **Production ready**: Optimized for deployment 