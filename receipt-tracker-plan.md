# Receipt Tracker – Step-by-Step Project Plan  
*(React + TypeScript + NestJS + Cloud OCR + OpenAI)*

---

## 0. Crystal-Clear App Flow (From Photo → Analytics)

Before we go into architecture and technology, let’s define **exactly what happens** in this app, step by step.

### 0.1. User Perspective

1. **Open Web App**  
   The user opens your receipt-tracking web app in the browser.

2. **Upload a Receipt Image/PDF**  
   On the **“Upload Receipt”** page, the user chooses a file (photo of a receipt or a scanned PDF) and clicks **Upload**.

3. **Wait for Processing**  
   The UI shows a **loading spinner / progress state** such as “Processing your receipt…”.

4. **See Parsed Receipt**  
   After a few seconds, the user is navigated to a **Receipt Detail** page where they see:
   - Store name
   - Date
   - Subtotal, tax, total
   - List of items (name, quantity, price, category)

5. **Optional Manual Edits**  
   The user can:
   - Fix item names if OCR/LLM got them slightly wrong.
   - Change categories (e.g., “Other” → “Groceries”).
   - Save changes.

6. **View History & Analytics**  
   On the **Dashboard**:
   - See total spending per month.
   - See spending per store (e.g., Walmart, Costco).
   - See spending per category (Groceries, Personal Care, etc.).
   - Filter by date range.

That’s the user’s experience.

---

### 0.2. System Perspective (Behind the Scenes)

Here’s what the system does internally when a receipt is uploaded:

1. **React App → NestJS API**
   - React sends a `POST /api/receipts` request with the file in `FormData`.

2. **NestJS: Receive File**
   - Validates file type/size.
   - Optionally saves the file to local disk or object storage.
   - Creates a temporary `Receipt` record with status `PROCESSING`.

3. **Call Cloud OCR Service**
   - NestJS sends the image to a **Cloud OCR / Document AI** endpoint.
   - The OCR service returns **raw text** (and possibly layout info).

4. **Call OpenAI LLM**
   - NestJS takes the OCR text and sends it to **OpenAI** with a carefully designed **prompt**.
   - The LLM returns a **structured JSON** with:
     - Store Info
     - Date, currency
     - Totals (subtotal, tax, total)
     - Line items (name, quantity, unit_price, line_total, category)

5. **Validation & Normalization**
   - NestJS validates the JSON (types, required fields).
   - Fills defaults if needed (e.g., missing category → “Other”).
   - Marks receipt as `needs_review` if something looks inconsistent.

6. **Save to PostgreSQL**
   - NestJS maps the JSON to entities:
     - `stores`, `receipts`, `receipt_items`, `categories`.
   - Saves everything in PostgreSQL.

7. **Return Response to React**
   - NestJS returns the full structured receipt object to the React app.
   - React navigates to the **Receipt Detail** page and shows the data.

8. **Analytics Queries**
   - For dashboards, React calls endpoints like:
     - `GET /api/expenses/monthly`
     - `GET /api/expenses/by-store`
     - `GET /api/expenses/by-category`
   - NestJS runs SQL aggregations on PostgreSQL and returns chart-friendly data.

---

## 1. High-Level Architecture Overview

### 1.1. Main Components

- **Frontend**
  - React + TypeScript
  - Uses React Query for server state, Zustand (or context) for UI filters.
- **Backend**
  - NestJS + TypeScript
  - Modules: `auth`, `receipts`, `stores`, `expenses`, `ai`.
- **Database**
  - PostgreSQL (relational DB, great for financial reporting).
- **Cloud OCR Service**
  - Any provider with:
    - REST API (image → text)
    - Free or cheap tier
- **OpenAI LLM**
  - Text model (cheaper than vision models).
  - Used for turning OCR text into structured JSON.

### 1.2. Data Flow Summary

1. React → NestJS (`POST /api/receipts` with image).
2. NestJS → OCR (image → text).
3. NestJS → OpenAI (text → structured JSON).
4. NestJS → PostgreSQL (persist entities).
5. React → NestJS (analytics endpoints).
6. NestJS → PostgreSQL (aggregations) → React (charts).

---

## 2. Cost-Effective AI/API Strategy

### 2.1. API Categories

- **OCR-only API**
  - Input: image
  - Output: raw text
  - Pros: cheap, often generous free tier.
  - Cons: you still need LLM to structure data.

- **Document/Receipt Parsing API**
  - Input: image
  - Output: semi-structured data (fields).
  - Pros: less logic needed on your side.
  - Cons: usually more expensive; less control; sometimes complex pricing.

- **General LLM / Vision LLM**
  - Input: image (vision model) or text (standard model).
  - Pros: can do everything (OCR + structuring).
  - Cons: vision models are relatively expensive.

### 2.2. Recommended Low-Budget Choice

For a **portfolio project with minimal cost**:

- Use a **simple Cloud OCR-only** API (image → text).
- Use **OpenAI text LLM** (not image model) to:
  - Convert OCR text → structured JSON.
  - Categorize items.

This combination usually gives:

- **Good quality results**
- **Control over schema**
- **Lower cost** than full Document AI or Vision LLM-only approaches.

---

## 3. Backend Setup (NestJS + PostgreSQL)

### 3.1. Create NestJS Project

**Step 3.1.1 – Initialize Project**

```bash
nest new receipt-tracker-backend
```

**Step 3.1.2 – Install Dependencies**

```bash
cd receipt-tracker-backend

# Database / ORM
npm install @nestjs/typeorm typeorm pg

# Validation
npm install class-validator class-transformer

# Config
npm install @nestjs/config

# HTTP client (if needed)
npm install axios

# OpenAI SDK (optional, or use fetch)
npm install openai
```

### 3.2. Configure ConfigModule & Environment

**Step 3.2.1 – Create `.env`**

```env
DATABASE_URL=postgres://user:password@localhost:5432/receipts_db
OCR_API_KEY=your-ocr-key
OCR_API_ENDPOINT=https://your-ocr-endpoint
OPENAI_API_KEY=your-openai-key
```

**Step 3.2.2 – Use ConfigModule**

In `app.module.ts`:

- Import `ConfigModule.forRoot()`.
- Configure `TypeOrmModule.forRootAsync()` to read from env.

### 3.3. Define Core Entities

At minimum:

- `User` (optional for MVP).
- `Store`
- `Receipt`
- `ReceiptItem`
- `Category`

You will create these as TypeORM entities with relationships:

- `User` 1–N `Receipt`
- `Store` 1–N `Receipt`
- `Receipt` 1–N `ReceiptItem`
- `Category` 1–N `ReceiptItem`

### 3.4. Create Backend Modules

Run:

```bash
nest g module receipts
nest g controller receipts
nest g service receipts

nest g module stores
nest g service stores

nest g module expenses
nest g controller expenses
nest g service expenses

nest g module ai
nest g service ai/ocr
nest g service ai/llm
```

---

## 4. Cloud OCR Integration

### 4.1. OCR Service Interface

Create a simple interface in `ai` module:

```ts
export interface OcrResult {
  rawText: string;
}
```

### 4.2. Implement `OcrService`

In `ai/ocr.service.ts`:

- Inject `ConfigService` (for endpoint, key).
- Implement:

```ts
async extractText(imageBuffer: Buffer): Promise<OcrResult> {
  // 1. Build HTTP request to OCR provider with the image.
  // 2. Parse JSON response.
  // 3. Return { rawText: ... }.
}
```

Handle:

- Authentication headers (API key).
- Common errors (invalid image, 4xx, 5xx).
- Optional: retry once on 5xx errors.

### 4.3. Connect `OcrService` to Receipts Flow

In `receipts.service.ts`:

```ts
async createFromUpload(userId: string, file: Express.Multer.File) {
  // optional: save file to disk or storage, get imageBuffer
  const ocrResult = await this.ocrService.extractText(file.buffer);

  // Next step: call LLM service with ocrResult.rawText
}
```

---

## 5. OpenAI LLM for Structured Extraction

### 5.1. Define Data Types

Create a `ParsedReceipt` type:

```ts
export interface ParsedReceipt {
  store: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  receipt_date: string; // ISO date
  currency?: string | null;
  totals: {
    subtotal?: number | null;
    tax?: number | null;
    total?: number | null;
  };
  items: Array<{
    name: string;
    quantity?: number | null;
    unit_price?: number | null;
    line_total?: number | null;
    category: string;
  }>;
}
```

### 5.2. Prompt Design

Create a template string:

- Explain the task: “Extract structured data from a receipt”.
- Provide schema and rules.
- Include 1–2 example receipts and JSON outputs (few-shot).
- Ask for **valid JSON only**.

### 5.3. Implement `LlmService`

In `ai/llm.service.ts`:

- Initialize OpenAI client with `OPENAI_API_KEY`.
- Implement:

```ts
async parseReceiptText(rawText: string): Promise<ParsedReceipt> {
  // 1. Build prompt.
  // 2. Call OpenAI (chat completion with JSON output).
  // 3. Parse the result as JSON.
  // 4. Return ParsedReceipt.
}
```

Add:

- **Error handling**:
  - If JSON parsing fails, retry with a “fix JSON” prompt.
- **Validation**:
  - Check required fields.
  - If something critical is missing, mark as `needsReview`.

### 5.4. Combine OCR + LLM in `ReceiptProcessingService`

Create a new service (or use `ReceiptsService`) that:

1. Receives `userId` and `file`.
2. Calls `ocrService.extractText(file.buffer)`.
3. Calls `llmService.parseReceiptText(rawText)`.
4. Maps `ParsedReceipt` → entities: `Store`, `Receipt`, `ReceiptItem`.
5. Saves records to PostgreSQL.
6. Returns the new `Receipt` with items to the controller.

---

## 6. Backend API Design

### 6.1. Receipt Endpoints

**`POST /api/receipts`**

- Use `FileInterceptor('file')` in NestJS.
- Steps:
  1. Validate file.
  2. Call processing service.
  3. Return structured receipt JSON.

**`GET /api/receipts/:id`**

- Return one receipt with items (joined or via relations).
- Ensure it belongs to the current user (if auth implemented).

**`GET /api/receipts`**

- List receipts:
  - Pagination: `page`, `limit`.
  - Filters: `from` / `to` date.

### 6.2. Expenses Summary Endpoints

**`GET /api/expenses/monthly`**

- Group receipts by month and sum totals.

**`GET /api/expenses/by-store`**

- Group totals by store.

**`GET /api/expenses/by-category`**

- Join `receipt_items` and `categories` and sum by category.

---

## 7. Frontend Setup (React + TypeScript)

### 7.1. Initialize React App

```bash
npm create vite@latest receipt-tracker-frontend -- --template react-ts
cd receipt-tracker-frontend
npm install
```

Install libraries:

```bash
npm install @tanstack/react-query zustand axios react-router-dom
# optional: tailwindcss or a UI library
```

### 7.2. Frontend Structure

- `src/pages/`
  - `UploadPage.tsx`
  - `ReceiptsPage.tsx`
  - `ReceiptDetailPage.tsx`
  - `DashboardPage.tsx`
  - `LoginPage.tsx` (optional)
- `src/components/`
  - `ReceiptUploadForm.tsx`
  - `ReceiptCard.tsx`
  - `ReceiptItemTable.tsx`
  - `charts/MonthlyExpensesChart.tsx`
  - `charts/CategoryBreakdownChart.tsx`
- `src/api/`
  - `httpClient.ts`
  - `receiptsApi.ts`
  - `expensesApi.ts`
- `src/hooks/`
  - `useReceipts.ts`
  - `useReceipt.ts`
  - `useExpenses.ts`
- `src/store/`
  - `filtersStore.ts` (Zustand)

### 7.3. Key Pages

#### 7.3.1. UploadPage

- A form with:
  - File input
  - Submit button
- On submit:
  - Create `FormData` with file.
  - `POST` to `/api/receipts`.
  - Show spinner while waiting.
  - On success, navigate to `/receipts/:id`.

#### 7.3.2. ReceiptDetailPage

- Use `useParams()` to get `id`.
- Use `useReceipt(id)` (React Query) to fetch data.
- Display:
  - Store, date, totals.
  - Table of items with editable category field.
- Optional:
  - Save button calling `PUT /api/receipts/:id`.

#### 7.3.3. ReceiptsPage

- Use `useReceipts(filters)` hook.
- Show list of receipt cards.
- Filters:
  - Date range.
  - Store filter.
- Filters stored in `filtersStore` (Zustand).

#### 7.3.4. DashboardPage

- Call:
  - `useMonthlyExpenses()`
  - `useExpensesByStore()`
  - `useExpensesByCategory()`
- Show charts and summary numbers.

---

## 8. Client-Side State Management

### 8.1. React Query (Server State)

- Initialize `QueryClient` in `main.tsx`.
- Create hooks:
  - `useReceipts(filters)`
  - `useReceipt(id)`
  - `useMonthlyExpenses()`
  - `useExpensesByStore()`
  - `useExpensesByCategory()`

Each hook:

- Uses `useQuery` with:
  - `queryKey`
  - `queryFn` calling your `api/...` functions.

### 8.2. Zustand (UI & Filters)

Create `filtersStore.ts`:

- State:
  - `from?: string`
  - `to?: string`
  - `selectedStoreId?: string`
- Actions:
  - `setFrom`, `setTo`, `setSelectedStoreId`.

Use it in:

- Filter components (date pickers, dropdown).
- Pass the filter values to `useReceipts` and `useExpenses` hooks.

---

## 9. Security, Env, and Cost Control

### 9.1. Environment

- Backend `.env`:
  - `DATABASE_URL`
  - `OCR_API_KEY`
  - `OCR_API_ENDPOINT`
  - `OPENAI_API_KEY`
- Do **not** expose them to the frontend.

### 9.2. API Keys

- Only backend can call OCR and OpenAI.
- Frontend only talks to NestJS.

### 9.3. Cost Control

- Use a **small text model** (not vision).
- Use a **cheap/free OCR** tier.
- Optionally:
  - Limit number of receipts per hour per user.
  - Log number of calls to OpenAI to monitor usage.

---

## 10. Testing and Deployment (Outline)

### 10.1. Backend Testing

- **Unit tests**:
  - `ReceiptProcessingService` with mocked `OcrService` and `LlmService`.
- **Integration tests**:
  - Controllers, using a test database.

### 10.2. Frontend Testing

- Use React Testing Library for:
  - Upload form (shows loading, handles success).
  - Receipt detail table (renders items, shows totals).

### 10.3. Deployment

- Use Docker Compose for local:
  - `db` (Postgres)
  - `backend` (NestJS)
- Host backend and DB on a Node-friendly host + DB service.
- Build frontend and deploy to Netlify / Vercel (or similar).

---

This Markdown file is your **master plan**:
- It starts with a clear process (user + system).
- It fixes the tech choices:
  - React + TypeScript
  - NestJS
  - Cloud OCR
  - OpenAI LLM
  - PostgreSQL
- It gives you **step-by-step phases** to follow in your IDE or in Cursor.
