# 🏗️ Architecture Guide - Receipt Tracker Backend

## ساختار پروژه (Project Structure)

این پروژه از **Layered Architecture** استفاده می‌کند که برای پروژه‌های متوسط مناسب است.

```
src/
├── entities/           # TypeORM Entities (Database Models)
│   ├── store.entity.ts
│   ├── category.entity.ts
│   ├── receipt.entity.ts
│   ├── receipt-item.entity.ts
│   └── index.ts
│
├── modules/           # Feature Modules (Domain Logic)
│   ├── receipts/
│   │   ├── dto/       # Data Transfer Objects
│   │   │   ├── create-receipt.dto.ts
│   │   │   ├── update-receipt.dto.ts
│   │   │   ├── receipt-response.dto.ts
│   │   │   └── index.ts
│   │   ├── receipts.controller.ts
│   │   ├── receipts.service.ts
│   │   └── receipts.module.ts
│   │
│   ├── stores/
│   ├── expenses/
│   └── ai/            # AI Services (OCR, LLM)
│       ├── ocr.service.ts
│       └── llm.service.ts
│
├── app.module.ts      # Root Module
└── main.ts            # Application Entry Point
```

## لایه‌های معماری (Architecture Layers)

### 1. **Entities Layer** (Database Models)
- تعریف ساختار دیتابیس
- TypeORM Decorators
- Relationships بین جداول

### 2. **DTOs Layer** (Data Transfer Objects)
- Validation با `class-validator`
- تبدیل داده‌ها بین لایه‌ها
- Input DTOs: `CreateReceiptDto`, `UpdateReceiptDto`
- Output DTOs: `ReceiptResponseDto`

### 3. **Controllers Layer** (API Endpoints)
- دریافت درخواست‌های HTTP
- Validation با DTOs
- فراخوانی Services
- برگرداندن Response

### 4. **Services Layer** (Business Logic)
- منطق کسب‌وکار
- تعامل با Database (Repository Pattern)
- فراخوانی AI Services
- تبدیل Entities به DTOs

### 5. **AI Services Layer**
- `OcrService`: استخراج متن از تصویر
- `LlmService`: تبدیل متن به JSON ساختاریافته

## Flow Example: Upload Receipt

```
1. Frontend → POST /api/receipts (with image file)
   ↓
2. ReceiptsController.receiveFile()
   - Validates file
   - Calls ReceiptsService
   ↓
3. ReceiptsService.createFromUpload()
   - Calls OcrService.extractText()
   - Calls LlmService.parseReceiptText()
   - Maps to Entities
   - Saves to Database
   ↓
4. Returns ReceiptResponseDto
   ↓
5. Frontend receives structured data
```

## مزایای این ساختار

✅ **ساده و قابل فهم**  
✅ **مناسب برای پروژه‌های متوسط**  
✅ **تست‌پذیر** (هر لایه جداگانه تست می‌شود)  
✅ **قابل توسعه** (افزودن feature جدید آسان است)  
✅ **مطابق با NestJS Best Practices**

## تفاوت با DDD

| Layered Architecture | Domain-Driven Design |
|---------------------|---------------------|
| ساده و سریع | پیچیده و زمان‌بر |
| مناسب پروژه‌های متوسط | مناسب پروژه‌های بزرگ |
| Focus روی Technical Layers | Focus روی Business Domain |
| Entities در یک پوشه | Entities در Domain Modules |

برای این پروژه، **Layered Architecture** کافی و مناسب است.






