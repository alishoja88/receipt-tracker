# Docker Setup Guide

This guide will help you set up the project with Docker.

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose installed

## 🚀 Development Mode Setup

### 1. Start with Docker Compose

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### 2. Access Services

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **PostgreSQL:** localhost:5432

### 3. Database Access

```bash
# Connect to PostgreSQL from inside container
docker exec -it receipt-tracker-db-dev psql -U alinina -d receipts_db

# Or from outside
psql -h localhost -U alinina -d receipts_db
```

## 🏭 Production Mode Setup

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Access

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000

## 📝 Useful Commands

### View Services Status
```bash
docker-compose ps
```

### Restart a Service
```bash
docker-compose restart backend
```

### View Logs for Specific Service
```bash
docker-compose logs -f backend
```

### Run Command in Container
```bash
docker-compose exec backend npm run format
```

### Remove Volumes (Delete Database)
```bash
docker-compose down -v
```

## 🔧 Environment Variables Setup

To use environment variables, create `.env` file in project root:

```env
OCR_API_KEY=your-key-here
OCR_API_ENDPOINT=https://vision.googleapis.com/v1/images:annotate
OPENAI_API_KEY=your-key-here
```

## 🐛 Troubleshooting

### Issue: Port Already in Use
```bash
# Check port
lsof -i :3000
lsof -i :5432
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Issue: Container Won't Start
```bash
# View logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
```

### Issue: Database Connection Failed
```bash
# Check health check
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```
