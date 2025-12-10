# 🏗️ Hybrid Architecture - Receipt Tracker

## ساختار نهایی (Hybrid DDD + Module-based)

این پروژه از یک **ساختار Hybrid** استفاده می‌کند که ترکیبی از:
- ✅ **DDD Layers** (Domain, Application, Infrastructure, Presentation)
- ✅ **Module-based Organization** (هر ماژول مستقل)

---

## ساختار ماژول Receipts

```
receipts/
├── domain/                    # ⭐ Business Logic (Pure)
│   └── receipt.domain.ts     # Domain Services & Business Rules
│
├── application/              # ⭐ Use Cases (Application Layer)
│   └── receipt.service.ts   # Application Service (Orchestration)
│
├── infrastructure/            # ⭐ Technical Implementation
│   └── persistence/         # Data Access
│       └── receipts.repository.ts
│
├── presentation/              # ⭐ API Layer
│   ├── receipts-get.controller.ts
│   ├── receipts-post.controller.ts
│   ├── receipts-put.controller.ts
│   ├── receipts-delete.controller.ts
│   └── receipt-mapper.helper.ts
│
├── dto/                       # Shared DTOs
│   ├── create-receipt.dto.ts
│   ├── update-receipt.dto.ts
│   └── receipt-response.dto.ts
│
├── entities/                  # Database Models
│   ├── receipt.entity.ts
│   ├── receipt-item.entity.ts
│   └── category.entity.ts
│
└── receipts.module.ts         # Module Configuration
```

---

## لایه‌های معماری

### 1. Domain Layer (Business Logic)
**مسئولیت**: Business Rules و Domain Logic

```typescript
// domain/receipt.domain.ts
export class ReceiptDomain {
  static needsReview(receipt): boolean
  static calculateTotalFromItems(items): number
  static canEdit(status): boolean
  static canDelete(status): boolean
}
```

**ویژگی‌ها**:
- ✅ مستقل از Infrastructure
- ✅ Business Rules خالص
- ✅ قابل تست بدون Database

---

### 2. Application Layer (Use Cases)
**مسئولیت**: Orchestration و Use Cases

```typescript
// application/receipt.service.ts
@Injectable()
export class ReceiptService {
  async createReceipt(dto): Promise<Receipt>
  async getReceipts(filters, pagination)
  async updateReceipt(id, dto): Promise<Receipt>
  async deleteReceipt(id): Promise<void>
}
```

**ویژگی‌ها**:
- ✅ Use Cases را پیاده‌سازی می‌کند
- ✅ از Domain و Infrastructure استفاده می‌کند
- ✅ DTOs را به Entities تبدیل می‌کند

---

### 3. Infrastructure Layer (Technical)
**مسئولیت**: پیاده‌سازی Technical Details

```typescript
// infrastructure/persistence/receipts.repository.ts
@Injectable()
export class ReceiptsRepository {
  async create(receipt): Promise<Receipt>
  async findById(id): Promise<Receipt | null>
  async findAll(filters, pagination)
  // ...
}
```

**ویژگی‌ها**:
- ✅ Database Access
- ✅ TypeORM Operations
- ✅ Query Optimization

---

### 4. Presentation Layer (API)
**مسئولیت**: HTTP Endpoints

```typescript
// presentation/receipts-get.controller.ts
@Controller('receipts')
export class ReceiptsGetController {
  @Get()
  async getReceipts(...)
  
  @Get(':id')
  async getReceiptById(...)
}
```

**ویژگی‌ها**:
- ✅ HTTP Request Handling
- ✅ Validation
- ✅ Response Mapping

---

## Flow Example: Create Receipt

```
1. Presentation Layer
   ReceiptsPostController.createReceipt()
   ↓
2. Application Layer
   ReceiptService.createReceipt()
   - Validates DTO
   - Calls Domain Logic
   ↓
3. Domain Layer
   ReceiptDomain.needsReview()
   - Business Rules
   ↓
4. Infrastructure Layer
   ReceiptsRepository.create()
   - Database Operations
   ↓
5. Response
   ReceiptMapper.toResponseDto()
   - Entity → DTO
```

---

## مزایای این ساختار

### ✅ DDD Benefits
- Business Logic جدا از Technical Details
- Domain Model غنی
- تست‌پذیری بالا

### ✅ Module-based Benefits
- هر ماژول مستقل
- سازماندهی واضح
- مقیاس‌پذیری

### ✅ Hybrid Benefits
- تعادل بین سادگی و ساختار
- مناسب برای پروژه‌های متوسط تا بزرگ
- قابل توسعه

---

## مقایسه با ساختارهای دیگر

| Aspect | Layered | DDD | **Hybrid (این پروژه)** |
|--------|---------|-----|----------------------|
| **سادگی** | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| **ساختار** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **مقیاس‌پذیری** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **تست‌پذیری** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **زمان توسعه** | سریع | کند | متوسط |

---

## Best Practices

### Domain Layer
- ✅ فقط Business Logic
- ✅ بدون وابستگی به Infrastructure
- ✅ Pure Functions

### Application Layer
- ✅ Use Cases
- ✅ Orchestration
- ✅ DTO Mapping

### Infrastructure Layer
- ✅ Technical Implementation
- ✅ Database Access
- ✅ External Services

### Presentation Layer
- ✅ HTTP Handling
- ✅ Validation
- ✅ Response Formatting

---

## ساختار برای ماژول‌های دیگر

همه ماژول‌ها باید همین ساختار را دنبال کنند:

```
module-name/
├── domain/           # Business Logic
├── application/      # Use Cases
├── infrastructure/   # Technical
├── presentation/     # API
├── dto/             # Shared
└── entities/         # Database
```

---

**این ساختار بهترین تعادل بین سادگی و ساختار است!** 🎯





