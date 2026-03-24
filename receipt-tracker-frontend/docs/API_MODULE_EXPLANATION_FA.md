# 📚 توضیحات کامل ماژول API

این سند به شما کمک می‌کند تا منطق و کارکرد ماژول `api.ts` را به طور کامل درک کنید.

---

## 🎯 مشکلاتی که این ماژول حل می‌کند

### 1. **مدیریت احراز هویت (Authentication)**
- **مشکل**: هر درخواست API نیاز به توکن دارد
- **راه حل**: به صورت خودکار توکن را به همه درخواست‌ها اضافه می‌کند

### 2. **مدیریت انقضای توکن (Token Expiry)**
- **مشکل**: وقتی توکن منقضی می‌شود، باید خودکار refresh شود
- **راه حل**: وقتی خطای 401 می‌آید، خودکار توکن را refresh می‌کند و درخواست را دوباره می‌زند

### 3. **مدیریت خطاها (Error Handling)**
- **مشکل**: خطاهای مختلف از سرور به شکل‌های مختلف می‌آیند
- **راه حل**: همه خطاها را به یک فرمت استاندارد تبدیل می‌کند

### 4. **ساده‌سازی استفاده از API**
- **مشکل**: نوشتن کد تکراری برای هر درخواست
- **راه حل**: توابع ساده `get`, `post`, `patch`, `put`, `delete` ارائه می‌دهد

---

## 📦 ساختار کلی ماژول

```
api.ts
├── Type Definitions (تعریف انواع داده)
├── Error Handling (مدیریت خطا)
├── Configuration (تنظیمات)
├── Axios Instance (ایجاد نمونه axios)
├── Interceptors (میان‌افزارها)
│   ├── Request Interceptor (قبل از ارسال)
│   └── Response Interceptor (بعد از دریافت)
├── API Helper Functions (توابع کمکی)
└── Utility Functions (توابع کاربردی)
```

---

## 🔍 توضیحات بخش به بخش

### 1️⃣ **تعریف انواع داده (Type Definitions)**

#### `ApiResponse<T>`
```typescript
export interface ApiResponse<T> {
  success?: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details: Record<string, unknown> | null;
  };
  meta?: {
    timestamp: string;
    path: string;
    pagination?: {...};
  };
}
```

**هدف**: تعریف ساختار استاندارد پاسخ API برای آینده

**چرا نیاز داریم؟**
- وقتی backend را تغییر دهیم، فقط یک جا باید تغییر بدهیم
- TypeScript می‌تواند نوع داده را چک کند

**مثال استفاده**:
```typescript
const response: ApiResponse<User> = await api.get('/user');
// TypeScript می‌داند که response.data از نوع User است
```

---

#### `ApiPaginatedResponse<T>`
```typescript
export interface ApiPaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**هدف**: برای لیست‌هایی که صفحه‌بندی دارند (مثل لیست receipt ها)

**مثال استفاده**:
```typescript
const receipts: ApiPaginatedResponse<Receipt> = await api.get('/receipts', { page: 1, limit: 20 });
console.log(receipts.items); // آرایه receipt ها
console.log(receipts.pagination.hasNext); // آیا صفحه بعدی وجود دارد؟
```

---

### 2️⃣ **مدیریت خطا (Error Handling)**

#### `ErrorCode` - کدهای خطا
```typescript
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  // ...
} as const;
```

**هدف**: به جای استفاده از رشته‌های جادویی، از ثابت‌ها استفاده می‌کنیم

**چرا بهتر است؟**
- اگر اشتباه تایپ کنیم، TypeScript خطا می‌دهد
- IDE می‌تواند autocomplete بدهد
- تغییر نام راحت‌تر است

**مثال**:
```typescript
// ❌ بد
if (error.code === 'UNAUTHORIZED') { ... }

// ✅ خوب
if (error.code === ErrorCode.UNAUTHORIZED) { ... }
```

---

#### `ERROR_MESSAGES` - پیام‌های خطا
```typescript
const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input data',
  [ErrorCode.UNAUTHORIZED]: 'Please login again',
  // ...
};
```

**هدف**: پیام‌های کاربرپسند برای نمایش به کاربر

**چرا نیاز داریم؟**
- پیام‌های سرور ممکن است فنی باشند
- می‌توانیم پیام‌ها را به فارسی ترجمه کنیم
- همه جا یک پیام یکسان نمایش داده می‌شود

---

#### `ApiError` - کلاس خطای سفارشی
```typescript
export class ApiError extends Error {
  public code: string;
  public details: Record<string, unknown> | null;
  public status: number;

  getLocalizedMessage(): string {
    return ERROR_MESSAGES[this.code] || this.message;
  }

  getValidationErrors(): Record<string, string> {
    if (this.code === ErrorCode.VALIDATION_ERROR && this.details) {
      return this.details as Record<string, string>;
    }
    return {};
  }
}
```

**هدف**: یک کلاس خطای استاندارد که اطلاعات بیشتری دارد

**مزایا**:
- می‌توانیم نوع خطا را چک کنیم (`instanceof ApiError`)
- می‌توانیم جزئیات خطا را بگیریم
- می‌توانیم پیام کاربرپسند بگیریم

**مثال استفاده**:
```typescript
try {
  await api.post('/receipts', data);
} catch (error) {
  if (error instanceof ApiError) {
    // نمایش پیام کاربرپسند
    showToast(error.getLocalizedMessage());
    
    // اگر خطای validation است، جزئیات را نشان بده
    if (error.code === ErrorCode.VALIDATION_ERROR) {
      const validationErrors = error.getValidationErrors();
      // validationErrors = { email: "Invalid email", name: "Name is required" }
    }
  }
}
```

---

### 3️⃣ **تنظیمات (Configuration)**

```typescript
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
};
```

**هدف**: تنظیمات مرکزی برای API

**چرا نیاز داریم؟**
- اگر URL سرور تغییر کند، فقط یک جا باید تغییر بدهیم
- می‌توانیم برای محیط‌های مختلف (dev, production) URL مختلف بگذاریم

**نکته**: `import.meta.env.VITE_API_URL` از فایل `.env` می‌آید

---

### 4️⃣ **ایجاد نمونه Axios (Axios Instance)**

```typescript
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**هدف**: یک نمونه axios با تنظیمات پیش‌فرض

**چرا نیاز داریم؟**
- به جای اینکه هر بار تنظیمات را بدهیم، یک بار می‌سازیم
- می‌توانیم interceptor اضافه کنیم (در ادامه می‌بینیم)

---

### 5️⃣ **میان‌افزارها (Interceptors)**

#### 🔵 **Request Interceptor** - قبل از ارسال درخواست

```typescript
apiClient.interceptors.request.use(
  async config => {
    // 1. گرفتن توکن از store
    const { useAuthStore } = await import('@/store/auth.store');
    const token = useAuthStore.getState().accessToken;
    
    // 2. اضافه کردن توکن به header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. لاگ کردن در حالت development
    if (import.meta.env.DEV && !config.url?.includes('/auth/')) {
      console.log(`🔵 API Request: ${config.method} ${config.url}`);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
```

**چه کاری انجام می‌دهد؟**

1. **اضافه کردن توکن**: قبل از هر درخواست، توکن را از store می‌گیرد و به header اضافه می‌کند
2. **لاگ کردن**: در حالت development، درخواست‌ها را لاگ می‌کند (برای debug)

**چرا `async import`؟**
- برای جلوگیری از circular dependency (اگر مستقیم import کنیم، ممکن است مشکل ایجاد شود)
- فقط وقتی نیاز است، store را import می‌کند

**مثال**:
```typescript
// وقتی این کد را می‌نویسیم:
await api.get('/receipts');

// در واقع این اتفاق می‌افتد:
// 1. Request Interceptor اجرا می‌شود
// 2. توکن از store گرفته می‌شود
// 3. به header اضافه می‌شود: Authorization: Bearer xyz123...
// 4. درخواست ارسال می‌شود
```

---

#### 🟢 **Response Interceptor (موفقیت)** - بعد از دریافت پاسخ موفق

```typescript
apiClient.interceptors.response.use(
  response => {
    // لاگ کردن در حالت development
    if (import.meta.env.DEV && !response.config.url?.includes('/auth/')) {
      console.log(`🟢 API Response: ${response.status} ${response.config.method} ${response.config.url}`);
    }
    return response;
  },
  // ...
);
```

**چه کاری انجام می‌دهد؟**
- فقط لاگ می‌کند (برای debug)
- پاسخ را بدون تغییر برمی‌گرداند

---

#### 🔴 **Response Interceptor (خطا)** - مدیریت خطاها

این بخش پیچیده‌ترین قسمت است. بیایید مرحله به مرحله ببینیم:

##### **مرحله 1: لاگ کردن خطا**
```typescript
if (import.meta.env.DEV && !originalRequest?.url?.includes('/auth/')) {
  console.log(`🔴 API Error: ${error.response?.status} ...`);
}
```

##### **مرحله 2: مدیریت خطای 401 (Unauthorized) - Refresh Token**

این بخش خیلی مهم است! بیایید ببینیم چه اتفاقی می‌افتد:

```typescript
if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
  // ...
}
```

**سناریو**: کاربر در حال کار است، توکن منقضی می‌شود، درخواست با 401 برمی‌گردد

**راه حل**: 
1. توکن را refresh کنیم
2. درخواست اصلی را دوباره بزنیم

**اما یک مشکل**: اگر چند درخواست همزمان با 401 بیایند چه؟

**راه حل هوشمندانه**:
```typescript
// اگر در حال refresh هستیم، صبر می‌کنیم
if (isRefreshing && refreshPromise) {
  await refreshPromise; // صبر می‌کنیم تا refresh تمام شود
  // سپس درخواست را دوباره می‌زنیم
} else {
  // اگر refresh نمی‌کنیم، شروع می‌کنیم
  isRefreshing = true;
  refreshPromise = refreshToken();
  // ...
}
```

**چرا این مهم است؟**
- اگر 5 درخواست همزمان با 401 بیایند، فقط یک بار refresh می‌کنیم
- بقیه صبر می‌کنند و از توکن جدید استفاده می‌کنند

**مثال عملی**:
```
زمان: 10:00:00 - کاربر در حال مشاهده لیست receipt ها است
زمان: 10:00:01 - توکن منقضی می‌شود
زمان: 10:00:02 - 3 درخواست همزمان با 401 برمی‌گردند:
  - GET /receipts
  - GET /user/profile  
  - GET /expenses

چه اتفاقی می‌افتد:
1. اولین درخواست (GET /receipts) شروع به refresh می‌کند
2. دو درخواست دیگر صبر می‌کنند
3. refresh تمام می‌شود
4. هر سه درخواست با توکن جدید دوباره زده می‌شوند
```

**اگر refresh ناموفق باشد؟**
```typescript
catch (refreshError) {
  // کاربر را logout می‌کنیم
  await useAuthStore.getState().logout();
  
  // به صفحه login هدایت می‌کنیم
  window.dispatchEvent(new CustomEvent('auth:logout', {
    detail: { redirectTo: '/login' }
  }));
}
```

##### **مرحله 3: تبدیل خطا به ApiError**

```typescript
// اگر خطا از سرور آمده باشد
if (error.response?.data) {
  const errorData = error.response.data;
  
  // فرمت wrapped (آینده)
  if (errorData.error) {
    throw new ApiError(errorData.error.code, errorData.error.message, ...);
  }
  
  // فرمت فعلی backend
  if (errorData.message) {
    throw new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, errorData.message, ...);
  }
}

// اگر خطای شبکه باشد
if (!error.response) {
  throw new ApiError(ErrorCode.NETWORK_ERROR, 'Network error occurred', null, 0);
}
```

**هدف**: همه خطاها را به یک فرمت استاندارد تبدیل می‌کنیم

---

### 6️⃣ **توابع کمکی API (API Helper Functions)**

```typescript
export const api = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await apiClient.get<T>(url, { params });
    // پردازش پاسخ و برگرداندن data
    return response.data as T;
  },
  
  post: async <T>(url: string, data?: unknown, ...): Promise<T> => {
    // ...
  },
  
  // ...
};
```

**هدف**: ساده‌سازی استفاده از API

**مزایا**:
- TypeScript support: می‌توانیم نوع داده را مشخص کنیم
- پردازش خودکار پاسخ: اگر فرمت wrapped باشد، خودش data را برمی‌گرداند
- استفاده ساده: فقط `api.get()` یا `api.post()` می‌زنیم

**مثال استفاده**:
```typescript
// ❌ بدون این ماژول (پیچیده)
const response = await axios.get('/api/receipts', {
  headers: { Authorization: `Bearer ${token}` },
  params: { page: 1, limit: 20 }
});
const receipts = response.data.items;

// ✅ با این ماژول (ساده)
const receipts = await api.get<ApiPaginatedResponse<Receipt>>('/api/receipts', {
  page: 1,
  limit: 20
});
```

**نکته مهم**: `<T>` یعنی Generic Type
- می‌توانیم نوع داده را مشخص کنیم
- TypeScript می‌داند که چه نوع داده‌ای برمی‌گردد

---

### 7️⃣ **توابع کاربردی (Utility Functions)**

```typescript
export const ApiUtils = {
  formatError: (error: unknown): string => {
    // تبدیل خطا به رشته قابل نمایش
  },
  
  getValidationErrors: (error: unknown): Record<string, string> => {
    // گرفتن خطاهای validation
  },
  
  isErrorType: (error: unknown, errorCode: ErrorCode): boolean => {
    // چک کردن نوع خطا
  },
  
  createQueryString: (params: Record<string, string | number | boolean>): string => {
    // ساخت query string از object
  },
  
  formatPaginationParams: (page: number, limit: number, search?: string) => {
    // فرمت کردن پارامترهای pagination
  },
};
```

**هدف**: توابع کمکی برای کارهای رایج

**مثال استفاده**:
```typescript
// نمایش خطا به کاربر
try {
  await api.post('/receipts', data);
} catch (error) {
  const message = ApiUtils.formatError(error);
  showToast(message); // "Please check your input data"
}

// چک کردن نوع خطا
if (ApiUtils.isErrorType(error, ErrorCode.UNAUTHORIZED)) {
  redirectToLogin();
}

// ساخت query string
const query = ApiUtils.createQueryString({ page: 1, limit: 20, search: 'test' });
// نتیجه: "?page=1&limit=20&search=test"
```

---

## 🔄 جریان کامل یک درخواست API

بیایید ببینیم وقتی `api.get('/receipts')` را می‌زنیم چه اتفاقی می‌افتد:

```
1. فراخوانی: api.get('/receipts')
   ↓
2. Request Interceptor اجرا می‌شود:
   - توکن از store گرفته می‌شود
   - به header اضافه می‌شود: Authorization: Bearer xyz...
   - لاگ می‌شود (در dev mode)
   ↓
3. درخواست به سرور ارسال می‌شود
   ↓
4. پاسخ از سرور می‌آید
   ↓
5. Response Interceptor اجرا می‌شود:
   
   اگر موفق باشد:
   - لاگ می‌شود
   - پاسخ برمی‌گردد
   
   اگر خطا باشد:
   - اگر 401 باشد:
     * توکن refresh می‌شود
     * درخواست دوباره زده می‌شود
   - اگر خطای دیگر باشد:
     * به ApiError تبدیل می‌شود
     * throw می‌شود
   ↓
6. داده به کاربر برمی‌گردد
```

---

## 💡 نکات مهم برای نوشتن ماژول مشابه

### 1. **استفاده از Interceptors**
- برای کارهای مشترک (مثل اضافه کردن توکن)
- برای مدیریت خطاها
- برای لاگ کردن

### 2. **مدیریت Refresh Token**
- از flag استفاده کنید (`isRefreshing`)
- از Promise استفاده کنید تا درخواست‌های همزمان صبر کنند
- از `_retry` flag استفاده کنید تا از حلقه بی‌نهایت جلوگیری کنید

### 3. **Type Safety**
- از Generic Types استفاده کنید (`<T>`)
- از TypeScript interfaces استفاده کنید
- از `as const` برای ثابت‌ها استفاده کنید

### 4. **Error Handling**
- یک کلاس خطای سفارشی بسازید
- همه خطاها را به یک فرمت تبدیل کنید
- پیام‌های کاربرپسند ارائه دهید

### 5. **ساده‌سازی استفاده**
- توابع ساده `get`, `post`, ... ارائه دهید
- پردازش پاسخ را خودکار کنید
- از توابع utility برای کارهای رایج استفاده کنید

---

## 📝 مثال‌های عملی

### مثال 1: گرفتن لیست receipt ها
```typescript
try {
  const response = await api.get<ApiPaginatedResponse<Receipt>>('/api/receipts', {
    page: 1,
    limit: 20,
    search: 'grocery'
  });
  
  console.log(response.items); // Receipt[]
  console.log(response.pagination.hasNext); // boolean
} catch (error) {
  if (error instanceof ApiError) {
    if (error.code === ErrorCode.UNAUTHORIZED) {
      // کاربر باید login کند
    } else {
      showToast(error.getLocalizedMessage());
    }
  }
}
```

### مثال 2: ایجاد receipt جدید
```typescript
try {
  const newReceipt = await api.post<Receipt>('/api/receipts', {
    store: 'Grocery Store',
    amount: 50.99,
    date: '2024-01-15'
  });
  
  console.log('Receipt created:', newReceipt);
} catch (error) {
  if (ApiUtils.isErrorType(error, ErrorCode.VALIDATION_ERROR)) {
    const errors = ApiUtils.getValidationErrors(error);
    // errors = { store: "Store is required", amount: "Amount must be positive" }
    showValidationErrors(errors);
  } else {
    showToast(ApiUtils.formatError(error));
  }
}
```

### مثال 3: به‌روزرسانی receipt
```typescript
try {
  const updated = await api.patch<Receipt>(`/api/receipts/${id}`, {
    amount: 75.50
  });
  
  console.log('Receipt updated:', updated);
} catch (error) {
  // مدیریت خطا...
}
```

---

## 🎓 خلاصه

این ماژول یک **لایه انتزاعی (Abstraction Layer)** است که:

1. ✅ مدیریت احراز هویت را خودکار می‌کند
2. ✅ مدیریت refresh token را خودکار می‌کند
3. ✅ خطاها را به فرمت استاندارد تبدیل می‌کند
4. ✅ استفاده از API را ساده می‌کند
5. ✅ Type Safety را فراهم می‌کند
6. ✅ لاگ کردن را برای debug فراهم می‌کند

**نتیجه**: به جای نوشتن کد تکراری در هر جا، یک بار این ماژول را می‌نویسیم و همه جا از آن استفاده می‌کنیم!

---

## ❓ سوالات متداول

### چرا از `async import` استفاده می‌کنیم؟
برای جلوگیری از circular dependency. اگر مستقیم import کنیم، ممکن است مشکل ایجاد شود.

### چرا از Generic Types (`<T>`) استفاده می‌کنیم؟
تا TypeScript بتواند نوع داده را چک کند و autocomplete بدهد.

### چرا از `isRefreshing` flag استفاده می‌کنیم؟
تا اگر چند درخواست همزمان با 401 بیایند، فقط یک بار refresh کنیم.

### چرا از `_retry` flag استفاده می‌کنیم؟
تا از حلقه بی‌نهایت جلوگیری کنیم (اگر refresh هم 401 بدهد).

---

**امیدوارم این توضیحات مفید بوده باشد!** 🎉

اگر سوالی دارید، بپرسید!
