# 📄 receipt-tracker

A receipt management and tracking system built with React, NestJS, PostgreSQL, and AI for automatic information extraction from receipt images.

## 🚀 Features

- 📸 **Receipt Upload**: Upload receipt images or PDFs
- 🤖 **Automatic Extraction**: Use OCR and OpenAI to extract information
- 📊 **Analytics Dashboard**: Display statistics and expense charts
- 🏪 **Store Management**: Track expenses by store
- 📁 **Categorization**: Automatic and manual item categorization
- 🔍 **Search & Filter**: Search and filter by date, store, and category

## 🛠️ Technologies

### Frontend
- **React 19** + **TypeScript**
- **Vite** - Build tool
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Routing
- **Recharts** - Charts and visualizations
- **Axios** - HTTP client

### Backend
- **NestJS** - Node.js framework
- **TypeORM** - ORM
- **PostgreSQL** - Database
- **OpenAI API** - AI text processing
- **Google Cloud Vision API** - OCR

### DevOps
- **Docker** & **Docker Compose**
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **ESLint** - Linting

## 📋 Prerequisites

- **Node.js** 20 or higher
- **Docker** and **Docker Compose**
- **PostgreSQL** (or use Docker)
- **API Keys**:
  - Google Cloud Vision API (for OCR)
  - OpenAI API (for text processing)

## 🚀 Quick Start

### Method 1: With Docker (Recommended)

```bash
# Clone the project
git clone <repository-url>
cd receipt-tracker

# Create .env file in receipt-tracker-backend
cp receipt-tracker-backend/.env.example receipt-tracker-backend/.env
# Then add your API keys to .env

# Start with Make
make up

# Or with Docker Compose directly
docker-compose -f docker-compose.dev.yml up -d
```

### Method 2: Without Docker

```bash
# Install dependencies
make install

# Start PostgreSQL (or use Docker only for DB)
docker-compose -f docker-compose.dev.yml up -d postgres

# Start Backend
make dev-backend

# In another terminal, start Frontend
make dev-frontend
```

## 📝 Environment Variables Setup

Create `.env` file in `receipt-tracker-backend`:

```env
# Database
DATABASE_URL=postgres://alinina@localhost:5432/receipts_db

# OCR Service (Google Cloud Vision)
OCR_API_KEY=your-google-cloud-vision-api-key
OCR_API_ENDPOINT=https://vision.googleapis.com/v1/images:annotate

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=3000
NODE_ENV=development
```

For complete API Keys setup guide, see [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md).

## 📚 Make Commands

The project includes a complete `Makefile` for easy management:

```bash
# Show all commands
make help

# Docker Commands
make up              # Start Development
make down            # Stop project
make logs            # View logs
make restart         # Restart

# Code Formatting
make format          # Format all code
make format-check    # Check formatting

# Database
make db-shell        # Connect to database
make db-reset        # Reset database

# Production
make prod-up         # Start Production
make prod-down       # Stop Production

# Cleanup
make clean           # Clean node_modules
make clean-docker    # Clean Docker resources
```

For complete command list:
```bash
make help
```

## 🏗️ Project Structure

```
receipt-tracker/
├── receipt-tracker-backend/     # NestJS Backend
│   ├── src/
│   │   ├── modules/            # NestJS modules
│   │   ├── entities/           # TypeORM entities
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── receipt-tracker-frontend/    # React Frontend
│   ├── src/
│   │   ├── pages/              # Pages
│   │   ├── components/         # Components
│   │   ├── api/                # API calls
│   │   └── hooks/              # Custom hooks
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # Production
├── docker-compose.dev.yml       # Development
├── Makefile                     # Management commands
└── README.md
```

## 🔧 Development

### Code Formatting

```bash
# Format all code
make format

# Or only backend/frontend
make format-backend
make format-frontend
```

### Tests

**Backend Tests:**
```bash
# Run unit tests
make test

# Run tests in watch mode
make test-watch

# Run with coverage
make test-cov

# Run E2E tests
make test-e2e
```

**Frontend Tests:**
```bash
# Run unit tests
make test-frontend

# Run tests with UI
make test-frontend-ui

# Run E2E tests
make test-frontend-e2e

# Run all tests
make test-all
```

For detailed testing guide, see [TESTING_GUIDE.md](./TESTING_GUIDE.md).

### Git Hooks

Husky automatically formats code before commit. No additional work needed!

## 📖 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup guide
- [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) - API Keys setup guide
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing guide (Unit & E2E)
- [receipt-tracker-plan.md](./receipt-tracker-plan.md) - Complete project plan

## 🌐 Service Access

### Development Mode
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### Production Mode
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000

## 🐛 Troubleshooting

### Issue: Port already in use
```bash
# Check port
lsof -i :3000
lsof -i :5432
lsof -i :5173
```

### Issue: Container won't start
```bash
# View logs
make logs

# Or for specific service
make logs-backend
make logs-frontend
```

### Issue: Database connection failed
```bash
# Check status
make ps

# Restart
make restart
```

## 📝 TODO

- [ ] Add Authentication
- [ ] Add unit tests
- [ ] Add CI/CD
- [ ] Improve UI/UX
- [ ] Add Export to Excel/PDF

## 📄 License

This project is built for educational and demonstration purposes.

## 👤 Author

Built with ❤️ for learning and development

---

**Note**: For more information, check the `.md` documentation files in the project.
