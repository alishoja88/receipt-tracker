.PHONY: help install up down build restart logs clean format test

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show available commands
	@echo "$(BLUE)📋 Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ============================================
# Docker Commands
# ============================================

up: ## Start project in Development mode
	@echo "$(BLUE)🚀 Starting project...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Project started!$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:3000$(NC)"

up-build: ## Build and start project
	@echo "$(BLUE)🔨 Building and starting project...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d --build

down: ## Stop project
	@echo "$(BLUE)🛑 Stopping project...$(NC)"
	docker-compose -f docker-compose.dev.yml down

down-v: ## Stop project and remove volumes (delete database)
	@echo "$(YELLOW)⚠️  Stopping project and removing database...$(NC)"
	docker-compose -f docker-compose.dev.yml down -v

restart: ## Restart project
	@echo "$(BLUE)🔄 Restarting...$(NC)"
	docker-compose -f docker-compose.dev.yml restart

logs: ## View logs for all services
	docker-compose -f docker-compose.dev.yml logs -f

logs-backend: ## View Backend logs
	docker-compose -f docker-compose.dev.yml logs -f backend

logs-frontend: ## View Frontend logs
	docker-compose -f docker-compose.dev.yml logs -f frontend

logs-db: ## View Database logs
	docker-compose -f docker-compose.dev.yml logs -f postgres

ps: ## Show services status
	docker-compose -f docker-compose.dev.yml ps

# ============================================
# Production Commands
# ============================================

prod-up: ## Start project in Production mode
	@echo "$(BLUE)🚀 Starting Production...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)✅ Production project started!$(NC)"

prod-down: ## Stop Production project
	docker-compose down

prod-logs: ## View Production logs
	docker-compose logs -f

# ============================================
# Database Commands
# ============================================

db-shell: ## Connect to PostgreSQL database
	docker-compose -f docker-compose.dev.yml exec postgres psql -U alinina -d receipts_db

db-reset: ## Reset database (delete and recreate)
	@echo "$(YELLOW)⚠️  Removing database...$(NC)"
	docker-compose -f docker-compose.dev.yml down -v
	@echo "$(BLUE)Creating new database...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d postgres
	@sleep 5
	@echo "$(GREEN)✅ Database reset!$(NC)"

# ============================================
# Code Formatting
# ============================================

format: ## Format all code
	@echo "$(BLUE)🔧 Formatting code...$(NC)"
	npm run format
	@echo "$(GREEN)✅ Code formatted!$(NC)"

format-check: ## Check code formatting (no changes)
	npm run format:check

format-backend: ## Format Backend code
	cd receipt-tracker-backend && npm run format

format-frontend: ## Format Frontend code
	cd receipt-tracker-frontend && npm run format

# ============================================
# Development Commands (without Docker)
# ============================================

install: ## Install dependencies for all projects
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	cd receipt-tracker-backend && npm install
	cd receipt-tracker-frontend && npm install
	npm install
	@echo "$(GREEN)✅ All dependencies installed!$(NC)"

dev-backend: ## Run Backend in Development mode (without Docker)
	cd receipt-tracker-backend && npm run start:dev

dev-frontend: ## Run Frontend in Development mode (without Docker)
	cd receipt-tracker-frontend && npm run dev

# ============================================
# Testing
# ============================================

test: ## Run backend unit tests
	cd receipt-tracker-backend && npm test

test-watch: ## Run backend tests in watch mode
	cd receipt-tracker-backend && npm run test:watch

test-cov: ## Run backend tests with coverage
	cd receipt-tracker-backend && npm run test:cov

test-e2e: ## Run backend E2E tests
	cd receipt-tracker-backend && npm run test:e2e

test-frontend: ## Run frontend unit tests
	cd receipt-tracker-frontend && npm test

test-frontend-ui: ## Run frontend tests with UI
	cd receipt-tracker-frontend && npm run test:ui

test-frontend-e2e: ## Run frontend E2E tests
	cd receipt-tracker-frontend && npm run test:e2e

test-all: ## Run all tests (backend + frontend)
	cd receipt-tracker-backend && npm test && cd ../receipt-tracker-frontend && npm run test:run

# ============================================
# Cleanup
# ============================================

clean: ## Clean node_modules and dist
	@echo "$(YELLOW)🧹 Cleaning unnecessary files...$(NC)"
	rm -rf receipt-tracker-backend/node_modules receipt-tracker-backend/dist
	rm -rf receipt-tracker-frontend/node_modules receipt-tracker-frontend/dist
	rm -rf node_modules
	@echo "$(GREEN)✅ Cleanup completed!$(NC)"

clean-docker: ## Clean Docker images and containers
	@echo "$(YELLOW)🧹 Cleaning Docker resources...$(NC)"
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker-compose down -v --rmi all
	@echo "$(GREEN)✅ Docker resources cleaned!$(NC)"

clean-all: clean clean-docker ## Clean everything (node_modules, dist, docker)

# ============================================
# Utility Commands
# ============================================

shell-backend: ## Enter Backend container shell
	docker-compose -f docker-compose.dev.yml exec backend sh

shell-frontend: ## Enter Frontend container shell
	docker-compose -f docker-compose.dev.yml exec frontend sh

rebuild: ## Rebuild all images
	@echo "$(BLUE)🔨 Rebuilding images...$(NC)"
	docker-compose -f docker-compose.dev.yml build --no-cache
	@echo "$(GREEN)✅ Build completed!$(NC)"

status: ## Show complete project status
	@echo "$(BLUE)📊 Project status:$(NC)"
	@echo ""
	@echo "$(GREEN)Docker Containers:$(NC)"
	@docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "$(GREEN)Ports:$(NC)"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:3000"
	@echo "  Database: localhost:5432"
