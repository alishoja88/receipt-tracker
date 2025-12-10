# 🏗️ Architecture Documentation - Receipt Tracker

## Table of Contents
- [Overview](#overview)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Data Flow](#data-flow)
- [Module Dependencies](#module-dependencies)

---

## Overview

This project uses a **Module-based Architecture** that emphasizes:
- ✅ Clear separation of concerns
- ✅ Scalability and maintainability
- ✅ Easy testing and debugging
- ✅ Best practices for NestJS and React

### Tech Stack
- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + Vite + React Query
- **AI Services**: OCR API + OpenAI API

---

## Backend Architecture

### Architecture Pattern: Module-Based Layered Architecture

```
receipt-tracker-backend/
├── src/
│   ├── modules/              # Feature modules (domain logic)
│   │   ├── stores/
│   │   ├── receipts/
│   │   ├── expenses/
│   │   └── ai/
│   │
│   ├── common/               # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   ├── config/               # Configuration
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   │
│   ├── app.module.ts         # Root module
│   └── main.ts               # Entry point
```

### Module Structure

Each module follows a consistent structure:

```
module-name/
├── entities/                 # Database models (TypeORM)
│   └── *.entity.ts
├── dto/                      # Data Transfer Objects
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── *-response.dto.ts
├── module-name.module.ts     # Module configuration
├── module-name.controller.ts # HTTP endpoints
├── module-name.service.ts    # Business logic
└── module-name.repository.ts # Database operations
```

---

## Backend Modules

### 1. Stores Module 🏪

**Purpose**: Manage store information

**Files**:
```
stores/
├── entities/
│   └── store.entity.ts
├── dto/
│   ├── create-store.dto.ts
│   └── store-response.dto.ts
├── stores.module.ts
├── stores.service.ts
└── stores.repository.ts
```

**Responsibilities**:
- CRUD operations for stores
- Find store by name (to avoid duplicates)
- List all stores

**Endpoints**:
- `GET /api/stores` - List all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create new store (internal)

---

### 2. Receipts Module 🧾

**Purpose**: Core receipt management

**Files**:
```
receipts/
├── entities/
│   ├── receipt.entity.ts
│   ├── receipt-item.entity.ts
│   └── category.entity.ts
├── dto/
│   ├── create-receipt.dto.ts
│   ├── update-receipt.dto.ts
│   ├── upload-receipt.dto.ts
│   └── receipt-response.dto.ts
├── receipts.module.ts
├── receipts.controller.ts
├── receipts.service.ts
└── receipts.repository.ts
```

**Responsibilities**:
- Upload receipt image
- CRUD operations for receipts
- Update receipt items/categories
- Mark receipt for review
- Pagination and filtering

**Endpoints**:
- `POST /api/receipts` - Upload receipt image
- `GET /api/receipts` - List receipts (with filters)
- `GET /api/receipts/:id` - Get receipt details
- `PUT /api/receipts/:id` - Update receipt
- `DELETE /api/receipts/:id` - Delete receipt

---

### 3. AI Module 🤖

**Purpose**: AI processing (OCR + LLM)

**Files**:
```
ai/
├── interfaces/
│   ├── ocr-result.interface.ts
│   └── parsed-receipt.interface.ts
├── ai.module.ts
├── ocr.service.ts
├── llm.service.ts
└── receipt-processing.service.ts
```

**Responsibilities**:
- Extract text from images (OCR)
- Parse text to structured JSON (LLM)
- Orchestrate full receipt processing pipeline

**Services**:

#### `OcrService`
- Call OCR API (OCR.space or Google Vision)
- Return raw text

#### `LlmService`
- Call OpenAI API
- Convert OCR text → structured JSON
- Categorize items

#### `ReceiptProcessingService`
- Orchestrate: OCR → LLM → Database
- Error handling and retries
- Mark receipts with issues as "needs_review"

---

### 4. Expenses Module 📊

**Purpose**: Analytics and reporting

**Files**:
```
expenses/
├── dto/
│   ├── monthly-expenses.dto.ts
│   ├── by-store.dto.ts
│   └── by-category.dto.ts
├── expenses.module.ts
├── expenses.controller.ts
└── expenses.service.ts
```

**Responsibilities**:
- Aggregate spending data
- Generate reports
- Filter by date range, store, category

**Endpoints**:
- `GET /api/expenses/monthly` - Monthly totals
- `GET /api/expenses/by-store` - Spending by store
- `GET /api/expenses/by-category` - Spending by category
- `GET /api/expenses/summary` - Overall summary

---

## Backend Layers

### Layer 1: Controllers (Presentation Layer)
- Handle HTTP requests
- Validate input (DTOs)
- Call services
- Return responses

### Layer 2: Services (Business Logic Layer)
- Business rules
- Orchestration
- Call repositories
- Transform data

### Layer 3: Repositories (Data Access Layer)
- Database queries
- TypeORM operations
- Raw SQL for complex queries

### Layer 4: Entities (Database Layer)
- TypeORM entities
- Database schema
- Relationships

---

## Frontend Architecture

### Architecture Pattern: Feature-Based Architecture

```
receipt-tracker-frontend/
├── src/
│   ├── features/             # Feature modules
│   │   ├── upload/
│   │   ├── receipts/
│   │   ├── dashboard/
│   │   └── auth/
│   │
│   ├── components/           # Shared components
│   │   ├── ui/              # Shadcn UI components
│   │   └── common/          # Custom shared components
│   │
│   ├── lib/                 # Utilities
│   │   ├── api/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── store/               # Global state (Zustand)
│   │   └── filters.store.ts
│   │
│   ├── types/               # TypeScript types
│   │
│   ├── App.tsx
│   └── main.tsx
```

---

## Frontend Features

### 1. Upload Feature 📤

**Purpose**: Upload receipt images

**Files**:
```
features/upload/
├── components/
│   ├── UploadForm.tsx
│   ├── DropZone.tsx
│   └── ProcessingStatus.tsx
├── hooks/
│   └── useUploadReceipt.ts
├── api/
│   └── uploadReceipt.ts
└── UploadPage.tsx
```

**Flow**:
1. User selects image
2. Show preview
3. Upload to backend
4. Show processing status
5. Navigate to receipt detail

---

### 2. Receipts Feature 🧾

**Purpose**: List and manage receipts

**Files**:
```
features/receipts/
├── components/
│   ├── ReceiptList.tsx
│   ├── ReceiptCard.tsx
│   ├── ReceiptDetail.tsx
│   ├── ItemsTable.tsx
│   └── Filters.tsx
├── hooks/
│   ├── useReceipts.ts
│   ├── useReceipt.ts
│   └── useUpdateReceipt.ts
├── api/
│   └── receiptsApi.ts
├── ReceiptsPage.tsx
└── ReceiptDetailPage.tsx
```

**Features**:
- Paginated list
- Filters (date range, store)
- Receipt details
- Edit items/categories
- Delete receipt

---

### 3. Dashboard Feature 📊

**Purpose**: Analytics and visualizations

**Files**:
```
features/dashboard/
├── components/
│   ├── MonthlyChart.tsx
│   ├── StoreChart.tsx
│   ├── CategoryChart.tsx
│   └── SummaryCards.tsx
├── hooks/
│   ├── useMonthlyExpenses.ts
│   ├── useExpensesByStore.ts
│   └── useExpensesByCategory.ts
├── api/
│   └── expensesApi.ts
└── DashboardPage.tsx
```

**Features**:
- Monthly spending chart
- Spending by store
- Spending by category
- Summary statistics

---

### 4. Auth Feature 🔐 (Optional)

**Purpose**: User authentication

**Files**:
```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── GoogleButton.tsx
├── hooks/
│   └── useAuth.ts
├── api/
│   └── authApi.ts
└── LoginPage.tsx
```

---

## Frontend State Management

### React Query (Server State)
- Fetch data from API
- Caching
- Auto refetch
- Optimistic updates

```typescript
// Example
const { data, isLoading } = useQuery({
  queryKey: ['receipts', filters],
  queryFn: () => fetchReceipts(filters),
});
```

### Zustand (UI State)
- Filters
- UI preferences
- User settings

```typescript
// Example
const useFiltersStore = create((set) => ({
  dateFrom: null,
  dateTo: null,
  storeId: null,
  setDateFrom: (date) => set({ dateFrom: date }),
}));
```

---

## Data Flow

### Upload Receipt Flow

```
┌─────────────┐
│   Frontend  │
│  (Upload)   │
└──────┬──────┘
       │ POST /api/receipts (multipart/form-data)
       ↓
┌──────────────────┐
│  ReceiptsController │
└──────┬───────────┘
       │ receiveFile()
       ↓
┌──────────────────────┐
│  ReceiptProcessing   │
│     Service          │
└──────┬───────────────┘
       │
       ├─→ OcrService.extractText()
       │   └─→ OCR API
       │
       ├─→ LlmService.parseReceipt()
       │   └─→ OpenAI API
       │
       └─→ ReceiptsService.save()
           └─→ Database
```

### Analytics Flow

```
┌─────────────┐
│   Frontend  │
│ (Dashboard) │
└──────┬──────┘
       │ GET /api/expenses/*
       ↓
┌──────────────────┐
│ ExpensesController│
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│  ExpensesService │
└──────┬───────────┘
       │ Aggregate queries
       ↓
┌──────────────────┐
│    PostgreSQL    │
└──────────────────┘
```

---

## Module Dependencies

### Backend Dependencies

```
app.module
├── stores.module
├── receipts.module
│   └── depends on: stores.module, ai.module
├── expenses.module
│   └── depends on: receipts.module
└── ai.module
```

### Import Rules
- ✅ Services can import other services
- ✅ Controllers only import their own service
- ✅ Repositories are injected via modules
- ❌ No circular dependencies

---

## API Endpoints Summary

### Receipts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts` | Upload receipt |
| GET | `/api/receipts` | List receipts |
| GET | `/api/receipts/:id` | Get receipt |
| PUT | `/api/receipts/:id` | Update receipt |
| DELETE | `/api/receipts/:id` | Delete receipt |

### Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List stores |
| GET | `/api/stores/:id` | Get store |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses/monthly` | Monthly totals |
| GET | `/api/expenses/by-store` | By store |
| GET | `/api/expenses/by-category` | By category |

---

## Best Practices

### Backend
- ✅ Use DTOs for validation
- ✅ Repository pattern for database access
- ✅ Service layer for business logic
- ✅ Dependency injection
- ✅ Global exception filters
- ✅ Request logging

### Frontend
- ✅ React Query for server state
- ✅ Zustand for UI state
- ✅ Custom hooks for logic
- ✅ Component composition
- ✅ TypeScript strict mode
- ✅ Error boundaries

---

## Testing Strategy

### Backend Testing
```
receipts/
├── receipts.service.spec.ts    # Unit tests
├── receipts.controller.spec.ts # Controller tests
└── receipts.e2e.spec.ts        # E2E tests
```

### Frontend Testing
```
features/receipts/
├── ReceiptList.test.tsx        # Component tests
└── useReceipts.test.ts         # Hook tests
```

---

## Deployment

### Development
```bash
# Backend
cd receipt-tracker-backend
npm run start:dev

# Frontend
cd receipt-tracker-frontend
npm run dev
```

### Production
```bash
# Docker
docker-compose up -d

# Or build separately
npm run build
npm run start:prod
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgres://user:pass@localhost:5432/receipts_db
OCR_API_KEY=your-ocr-key
OCR_API_ENDPOINT=https://api.ocr.space/parse/image
OPENAI_API_KEY=your-openai-key
NODE_ENV=development
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

---

## Next Steps

1. ✅ Setup entities and database
2. 🔄 Implement modules in order:
   - Stores
   - Receipts
   - AI
   - Expenses
3. 🔄 Build frontend features
4. 🔄 Integration testing
5. 🔄 Deployment

---

**Last Updated**: 2024
**Version**: 1.0






