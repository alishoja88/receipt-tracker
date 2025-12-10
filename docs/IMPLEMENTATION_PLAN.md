# 📋 Implementation Plan - Step by Step

## Overview
This document outlines the step-by-step implementation plan for the Receipt Tracker project.

---

## Phase 1: Backend Core Setup ✅

### Step 1.1: Database Entities (COMPLETED)
- [x] Create `Store` entity
- [x] Create `Category` entity
- [x] Create `Receipt` entity
- [x] Create `ReceiptItem` entity
- [x] Configure TypeORM in `app.module.ts`

### Step 1.2: Generate Modules (IN PROGRESS)
- [x] Generate `receipts` module
- [x] Generate `stores` module
- [ ] Generate `expenses` module
- [ ] Generate `ai` module

---

## Phase 2: Stores Module 🏪

### Priority: HIGH
**Estimated Time**: 2-3 hours

### Tasks:
1. **Create Repository**
   ```typescript
   // stores.repository.ts
   - findAll()
   - findById()
   - findByName()
   - create()
   ```

2. **Implement Service**
   ```typescript
   // stores.service.ts
   - getAllStores()
   - getStoreById()
   - findOrCreateStore(name, address?, phone?)
   ```

3. **Test Service**
   - Unit tests for service methods
   - Mock repository

**Files to Create**:
- `src/modules/stores/stores.repository.ts`
- `src/modules/stores/dto/create-store.dto.ts`
- `src/modules/stores/dto/store-response.dto.ts`

**Dependencies**: None (standalone)

---

## Phase 3: Categories Setup 📁

### Priority: HIGH
**Estimated Time**: 1-2 hours

### Tasks:
1. **Seed Default Categories**
   ```typescript
   // Create migration or seeder
   Default categories:
   - Groceries
   - Personal Care
   - Household
   - Electronics
   - Clothing
   - Other
   ```

2. **Create Categories Service**
   ```typescript
   // categories.service.ts (in receipts module)
   - findOrCreateCategory(name)
   - getAllCategories()
   ```

**Files to Create**:
- `src/modules/receipts/categories.service.ts`
- `database/seeds/categories.seed.ts`

---

## Phase 4: Receipts Module 🧾

### Priority: HIGH
**Estimated Time**: 4-6 hours

### Step 4.1: DTOs
Create all necessary DTOs:
```typescript
- create-receipt.dto.ts
- update-receipt.dto.ts
- upload-receipt.dto.ts
- receipt-response.dto.ts
- receipt-item-response.dto.ts
```

### Step 4.2: Repository
```typescript
// receipts.repository.ts
- create()
- findById()
- findAll(filters, pagination)
- update()
- delete()
- findByDateRange()
- findByStore()
```

### Step 4.3: Service (Basic CRUD)
```typescript
// receipts.service.ts
- createReceipt(dto)
- getReceipts(filters, pagination)
- getReceiptById(id)
- updateReceipt(id, dto)
- deleteReceipt(id)
```

### Step 4.4: Controller
```typescript
// receipts.controller.ts
POST   /api/receipts         - Upload receipt (placeholder)
GET    /api/receipts         - List receipts
GET    /api/receipts/:id     - Get receipt detail
PUT    /api/receipts/:id     - Update receipt
DELETE /api/receipts/:id     - Delete receipt
```

### Step 4.5: Testing
- Unit tests for service
- Controller tests
- Integration tests

**Files to Create**:
- All DTOs
- `receipts.repository.ts`
- Update `receipts.service.ts`
- Update `receipts.controller.ts`

**Dependencies**: 
- `stores.module` (to find/create stores)
- Categories service

---

## Phase 5: AI Module 🤖

### Priority: HIGH
**Estimated Time**: 6-8 hours

### Step 5.1: OCR Service

**Choose OCR Provider**:
- Option A: OCR.space (Free, 25k/month)
- Option B: Google Cloud Vision (Better accuracy)

```typescript
// ocr.service.ts
interface OcrResult {
  rawText: string;
  confidence?: number;
}

class OcrService {
  async extractText(imageBuffer: Buffer): Promise<OcrResult>
}
```

**Tasks**:
- Configure API credentials
- Implement HTTP client
- Error handling
- Retry logic

### Step 5.2: LLM Service

```typescript
// llm.service.ts
interface ParsedReceipt {
  store: { name, address?, phone? };
  receiptDate: string;
  currency?: string;
  totals: { subtotal?, tax?, total };
  items: Array<{
    name, quantity?, unitPrice?, lineTotal?, category
  }>;
}

class LlmService {
  async parseReceiptText(rawText: string): Promise<ParsedReceipt>
}
```

**Tasks**:
- Design prompt template
- Implement OpenAI client
- JSON parsing & validation
- Error handling

### Step 5.3: Receipt Processing Service

```typescript
// receipt-processing.service.ts
class ReceiptProcessingService {
  async processReceiptImage(
    file: Express.Multer.File
  ): Promise<Receipt>
}
```

**Flow**:
1. Call `ocrService.extractText()`
2. Call `llmService.parseReceiptText()`
3. Validate parsed data
4. Find or create store
5. Find or create categories
6. Create receipt + items
7. Save to database

**Tasks**:
- Orchestrate full pipeline
- Transaction handling
- Error recovery
- Mark issues as "needs_review"

### Step 5.4: Update Receipts Controller

```typescript
// receipts.controller.ts
@Post()
@UseInterceptors(FileInterceptor('file'))
async uploadReceipt(@UploadedFile() file) {
  return this.receiptProcessingService.processReceiptImage(file);
}
```

**Files to Create**:
- `src/modules/ai/ai.module.ts`
- `src/modules/ai/ocr.service.ts`
- `src/modules/ai/llm.service.ts`
- `src/modules/ai/receipt-processing.service.ts`
- `src/modules/ai/interfaces/ocr-result.interface.ts`
- `src/modules/ai/interfaces/parsed-receipt.interface.ts`

**Dependencies**:
- `receipts.module`
- `stores.module`

---

## Phase 6: Expenses Module 📊

### Priority: MEDIUM
**Estimated Time**: 3-4 hours

### Step 6.1: DTOs
```typescript
- monthly-expenses.dto.ts
- by-store.dto.ts
- by-category.dto.ts
- expenses-summary.dto.ts
```

### Step 6.2: Service

```typescript
// expenses.service.ts
- getMonthlyExpenses(dateFrom?, dateTo?)
- getExpensesByStore(dateFrom?, dateTo?)
- getExpensesByCategory(dateFrom?, dateTo?)
- getSummary(dateFrom?, dateTo?)
```

**Queries**:
- Use TypeORM query builder
- Aggregations: SUM, GROUP BY
- Date filtering

### Step 6.3: Controller

```typescript
// expenses.controller.ts
GET /api/expenses/monthly
GET /api/expenses/by-store
GET /api/expenses/by-category
GET /api/expenses/summary
```

**Files to Create**:
- All DTOs
- `expenses.service.ts`
- `expenses.controller.ts`

**Dependencies**: 
- `receipts.module` (read-only)

---

## Phase 7: Frontend - Upload Feature 📤

### Priority: HIGH
**Estimated Time**: 4-5 hours

### Tasks:
1. **Upload Form Component**
   ```tsx
   - File input / drag-drop
   - Image preview
   - Upload button
   - Progress indicator
   ```

2. **API Integration**
   ```typescript
   // api/uploadReceipt.ts
   export const uploadReceipt = async (file: File) => {
     const formData = new FormData();
     formData.append('file', file);
     return axios.post('/api/receipts', formData);
   };
   ```

3. **Custom Hook**
   ```typescript
   // hooks/useUploadReceipt.ts
   export const useUploadReceipt = () => {
     return useMutation({
       mutationFn: uploadReceipt,
       onSuccess: (data) => {
         navigate(`/receipts/${data.id}`);
       },
     });
   };
   ```

4. **Upload Page**
   - Layout
   - Form
   - Error handling
   - Success navigation

**Files to Create**:
- `src/features/upload/components/UploadForm.tsx`
- `src/features/upload/components/DropZone.tsx`
- `src/features/upload/hooks/useUploadReceipt.ts`
- `src/features/upload/api/uploadReceipt.ts`
- `src/features/upload/UploadPage.tsx`

---

## Phase 8: Frontend - Receipts Feature 🧾

### Priority: HIGH
**Estimated Time**: 6-8 hours

### Step 8.1: List Page
```tsx
- ReceiptCard component
- Pagination
- Filters (date range, store)
- Loading states
- Empty states
```

### Step 8.2: Detail Page
```tsx
- Receipt header (store, date, total)
- Items table (editable)
- Edit mode
- Save changes
- Delete receipt
```

### Step 8.3: API Integration
```typescript
// api/receiptsApi.ts
- fetchReceipts(filters, page)
- fetchReceiptById(id)
- updateReceipt(id, data)
- deleteReceipt(id)
```

### Step 8.4: Custom Hooks
```typescript
- useReceipts(filters)
- useReceipt(id)
- useUpdateReceipt()
- useDeleteReceipt()
```

**Files to Create**:
- Multiple components
- API functions
- Custom hooks
- Two pages

---

## Phase 9: Frontend - Dashboard 📊

### Priority: MEDIUM
**Estimated Time**: 5-6 hours

### Tasks:
1. **Charts Components**
   ```tsx
   - MonthlyChart (line/bar chart)
   - StoreChart (pie chart)
   - CategoryChart (bar chart)
   - SummaryCards (total, avg, count)
   ```

2. **API Integration**
   ```typescript
   - fetchMonthlyExpenses()
   - fetchExpensesByStore()
   - fetchExpensesByCategory()
   ```

3. **Dashboard Page**
   - Layout with charts
   - Date range filter
   - Loading states

**Dependencies**:
- Recharts library
- Custom hooks

---

## Phase 10: Testing & Polish 🧪

### Priority: MEDIUM
**Estimated Time**: 4-6 hours

### Backend Tests
- Service unit tests
- Controller tests
- Integration tests
- E2E tests

### Frontend Tests
- Component tests (RTL)
- Hook tests
- Integration tests

### Polish
- Error handling
- Loading states
- Empty states
- Validation messages
- Toast notifications

---

## Phase 11: Deployment 🚀

### Priority: MEDIUM
**Estimated Time**: 3-4 hours

### Tasks:
1. **Docker Setup**
   - Production Dockerfile
   - Docker Compose production
   - Environment config

2. **Database Migrations**
   - Setup TypeORM migrations
   - Migration scripts

3. **Deployment Guide**
   - Update README
   - Deployment instructions

---

## Timeline Estimate

| Phase | Description | Time | Status |
|-------|-------------|------|--------|
| 1 | Backend Setup | 2h | ✅ DONE |
| 2 | Stores Module | 3h | 🔄 NEXT |
| 3 | Categories | 2h | ⏳ TODO |
| 4 | Receipts Module | 6h | ⏳ TODO |
| 5 | AI Module | 8h | ⏳ TODO |
| 6 | Expenses Module | 4h | ⏳ TODO |
| 7 | Frontend Upload | 5h | ⏳ TODO |
| 8 | Frontend Receipts | 8h | ⏳ TODO |
| 9 | Frontend Dashboard | 6h | ⏳ TODO |
| 10 | Testing & Polish | 6h | ⏳ TODO |
| 11 | Deployment | 4h | ⏳ TODO |
| **TOTAL** | | **~54h** | |

---

## Current Status

### ✅ Completed
- Database entities
- TypeORM configuration
- Basic module structure

### 🔄 In Progress
- Module generation
- Project structure

### ⏳ Next Steps
1. Complete stores module
2. Setup categories
3. Implement receipts CRUD
4. Integrate AI services

---

## Notes

- Authentication is optional for MVP
- Focus on core features first
- Test incrementally
- Keep commits small and focused

---

**Last Updated**: 2024
**Version**: 1.0






