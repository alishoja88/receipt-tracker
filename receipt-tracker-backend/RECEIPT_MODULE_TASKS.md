# 📋 Receipt Module - لیست کارها

## ✅ Phase 1: تغییرات Entities (انجام شد)

- [x] ساده‌سازی ReceiptItem: حذف quantity, unitPrice, categoryId
- [x] اضافه کردن categoryId به Store Entity
- [x] تغییر Category: فقط برای Store (حذف relation به ReceiptItem)
- [x] ساده‌سازی DTOs
- [x] آپدیت Response DTOs

---

## 📝 Phase 2: Repository (باید انجام شود)

### 2.1. ReceiptsRepository

**فایل**: `src/modules/receipts/receipts.repository.ts`

**متدهای مورد نیاز**:

```typescript
- create(receipt: Receipt): Promise<Receipt>
- findById(id: string): Promise<Receipt | null>
- findAll(filters, pagination): Promise<{items: Receipt[], total: number}>
- update(id: string, data: Partial<Receipt>): Promise<Receipt>
- delete(id: string): Promise<void>
- findByDateRange(from: Date, to: Date): Promise<Receipt[]>
- findByStoreId(storeId: string): Promise<Receipt[]>
- findByStatus(status: ReceiptStatus): Promise<Receipt[]>
```

**وظایف**:
- استفاده از TypeORM Repository
- Query Builder برای فیلترها
- Pagination
- Relations (store, items)

---

## 🔧 Phase 3: Service (باید انجام شود)

### 3.1. ReceiptsService

**فایل**: `src/modules/receipts/receipts.service.ts`

**متدهای مورد نیاز**:

#### 3.1.1. Create Receipt
```typescript
createReceipt(dto: CreateReceiptDto): Promise<Receipt>
```
- پیدا کردن یا ایجاد Store
- پیدا کردن یا ایجاد Store Category (اگر storeCategoryName داده شده)
- ایجاد Receipt
- ایجاد ReceiptItems
- ذخیره در دیتابیس

#### 3.1.2. Get Receipts (List)
```typescript
getReceipts(filters, pagination): Promise<{items, pagination}>
```
- فیلترها: dateFrom, dateTo, storeId, status
- Pagination: page, limit
- Sort: createdAt DESC

#### 3.1.3. Get Receipt by ID
```typescript
getReceiptById(id: string): Promise<Receipt>
```
- Load relations: store, items

#### 3.1.4. Update Receipt
```typescript
updateReceipt(id: string, dto: UpdateReceiptDto): Promise<Receipt>
```
- Update receipt fields
- Update store (find or create)
- Update items (delete old, create new)

#### 3.1.5. Delete Receipt
```typescript
deleteReceipt(id: string): Promise<void>
```
- Delete receipt (cascade delete items)

---

## 🌐 Phase 4: Controller (باید انجام شود)

### 4.1. ReceiptsController

**فایل**: `src/modules/receipts/receipts.controller.ts`

**Endpoints**:

#### 4.1.1. POST /api/receipts
- Upload receipt image
- Use FileInterceptor
- Call ReceiptProcessingService (بعداً با AI Module)

#### 4.1.2. GET /api/receipts
- Query params: page, limit, dateFrom, dateTo, storeId, status
- Return paginated list

#### 4.1.3. GET /api/receipts/:id
- Get receipt detail with items

#### 4.1.4. PUT /api/receipts/:id
- Update receipt
- Body: UpdateReceiptDto

#### 4.1.5. DELETE /api/receipts/:id
- Delete receipt

---

## 🧪 Phase 5: Testing (باید انجام شود)

### 5.1. Unit Tests
- ReceiptsService tests
- Mock repository
- Test all methods

### 5.2. Integration Tests
- ReceiptsController tests
- E2E tests

---

## 📊 خلاصه کارها

| Phase | Task | Status | Priority |
|-------|------|--------|----------|
| 1 | تغییرات Entities | ✅ Done | - |
| 2 | ReceiptsRepository | ⏳ TODO | HIGH |
| 3 | ReceiptsService | ⏳ TODO | HIGH |
| 4 | ReceiptsController | ⏳ TODO | HIGH |
| 5 | Testing | ⏳ TODO | MEDIUM |

---

## 🎯 ترتیب انجام کارها

1. ✅ **Phase 1**: تغییرات Entities (انجام شد)
2. ⏳ **Phase 2**: ReceiptsRepository ← **مرحله بعدی**
3. ⏳ **Phase 3**: ReceiptsService
4. ⏳ **Phase 4**: ReceiptsController
5. ⏳ **Phase 5**: Testing

---

**آماده برای شروع Phase 2: ReceiptsRepository** 🚀





