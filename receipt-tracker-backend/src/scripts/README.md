# Seed Script

این script برای تولید داده‌های تست استفاده می‌شود.

## استفاده

### روش 1: استفاده از npm script
```bash
npm run seed
```

### روش 2: اجرای مستقیم
```bash
ts-node -r tsconfig-paths/register src/scripts/seed.ts
```

## چه کاری انجام می‌دهد؟

1. **ایجاد یا استفاده از کاربر تست**: یک کاربر با ایمیل `test@example.com` ایجاد می‌کند یا از کاربر موجود استفاده می‌کند.

2. **حذف receipts موجود**: تمام receipts موجود برای کاربر تست را حذف می‌کند.

3. **تولید داده‌های تست**:
   - **50 receipt تصادفی**: با store، category، تاریخ و مبلغ مختلف
   - **5 گروه receipt**: که هر گروه شامل چند receipt است که از یک فاکتور اصلی تقسیم شده‌اند (simulating multi-category receipts)
     - Walmart: GROCERY + HEALTH
     - Costco: GROCERY + SHOPPING
     - Target: SHOPPING + ENTERTAINMENT
     - Whole Foods: GROCERY + RESTAURANT
     - CVS Pharmacy: HEALTH + OTHER

4. **تاریخ‌ها**: receipts در بازه 3 ماه گذشته تا امروز تولید می‌شوند.

5. **گروه‌بندی**: receipts که از یک فاکتور اصلی هستند، `createdAt` یکسان یا نزدیک به هم دارند (در عرض 2 ثانیه).

## خروجی

بعد از اجرا، یک خلاصه نمایش داده می‌شود که شامل:
- تعداد کل receipts
- مجموع هزینه‌ها
- میانگین هزینه هر receipt
- تعداد receipts بر اساس category
- تعداد receipts بر اساس store

## نکات مهم

- این script فقط برای محیط development و testing است.
- قبل از اجرا، مطمئن شوید که database در حال اجرا است.
- تمام receipts موجود برای کاربر تست حذف می‌شوند.
- برای استفاده در production، این script را اجرا نکنید.

## تنظیمات

می‌توانید در فایل `seed.ts` تنظیمات زیر را تغییر دهید:
- تعداد receipts: متغیر `count` در `generateReceiptData()`
- بازه تاریخ: متغیر‌های `startDate` و `endDate`
- Storeها: آرایه `stores`
- Categoryها: آرایه `categories`
- مبالغ: محدوده در `getRandomNumber()`


