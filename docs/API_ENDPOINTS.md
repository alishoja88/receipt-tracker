# 🔌 API Endpoints Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Table of Contents
- [Receipts Endpoints](#receipts-endpoints)
- [Stores Endpoints](#stores-endpoints)
- [Expenses Endpoints](#expenses-endpoints)
- [Categories Endpoints](#categories-endpoints)
- [Error Responses](#error-responses)

---

## Receipts Endpoints

### 1. Upload Receipt Image

**Upload a receipt image for OCR processing**

```http
POST /api/receipts
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <image file> (required)
- Supported formats: jpg, jpeg, png, pdf
- Max size: 10MB
```

**Response: 201 Created**
```json
{
  "id": "uuid",
  "store": {
    "id": "uuid",
    "name": "Walmart",
    "address": "123 Main St",
    "phone": "555-1234"
  },
  "receiptDate": "2024-01-15",
  "currency": "USD",
  "subtotal": 45.50,
  "tax": 3.64,
  "total": 49.14,
  "status": "COMPLETED",
  "needsReview": false,
  "items": [
    {
      "id": "uuid",
      "name": "Milk",
      "quantity": 2,
      "unitPrice": 3.99,
      "lineTotal": 7.98,
      "category": {
        "id": "uuid",
        "name": "Groceries",
        "description": "Food and beverages"
      }
    },
    {
      "id": "uuid",
      "name": "Bread",
      "quantity": 1,
      "unitPrice": 2.50,
      "lineTotal": 2.50,
      "category": {
        "id": "uuid",
        "name": "Groceries",
        "description": "Food and beverages"
      }
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file format or size
- `500 Internal Server Error`: OCR or LLM processing failed

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/receipts \
  -F "file=@receipt.jpg"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/receipts', {
  method: 'POST',
  body: formData,
});

const receipt = await response.json();
```

---

### 2. Get All Receipts

**Retrieve a paginated list of receipts with filters**

```http
GET /api/receipts
```

**Query Parameters:**
```
page      (optional, default: 1)       - Page number
limit     (optional, default: 20)      - Items per page
dateFrom  (optional)                   - Filter from date (YYYY-MM-DD)
dateTo    (optional)                   - Filter to date (YYYY-MM-DD)
storeId   (optional)                   - Filter by store UUID
status    (optional)                   - Filter by status (PROCESSING, COMPLETED, FAILED, NEEDS_REVIEW)
```

**Response: 200 OK**
```json
{
  "items": [
    {
      "id": "uuid",
      "store": {
        "id": "uuid",
        "name": "Walmart"
      },
      "receiptDate": "2024-01-15",
      "total": 49.14,
      "status": "COMPLETED",
      "needsReview": false,
      "itemsCount": 5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Example:**
```bash
# Get receipts from January 2024
curl "http://localhost:3000/api/receipts?dateFrom=2024-01-01&dateTo=2024-01-31&page=1&limit=10"

# Get receipts from specific store
curl "http://localhost:3000/api/receipts?storeId=uuid-here"

# Get receipts that need review
curl "http://localhost:3000/api/receipts?status=NEEDS_REVIEW"
```

---

### 3. Get Receipt by ID

**Retrieve detailed information about a specific receipt**

```http
GET /api/receipts/:id
```

**Path Parameters:**
```
id (required) - Receipt UUID
```

**Response: 200 OK**
```json
{
  "id": "uuid",
  "store": {
    "id": "uuid",
    "name": "Walmart",
    "address": "123 Main St",
    "phone": "555-1234"
  },
  "receiptDate": "2024-01-15",
  "currency": "USD",
  "subtotal": 45.50,
  "tax": 3.64,
  "total": 49.14,
  "status": "COMPLETED",
  "needsReview": false,
  "rawOcrText": "WALMART\n123 Main St...",
  "imageUrl": "/uploads/receipts/uuid.jpg",
  "items": [
    {
      "id": "uuid",
      "name": "Milk",
      "quantity": 2,
      "unitPrice": 3.99,
      "lineTotal": 7.98,
      "category": {
        "id": "uuid",
        "name": "Groceries",
        "description": "Food and beverages"
      }
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Receipt not found

**Example:**
```bash
curl http://localhost:3000/api/receipts/uuid-here
```

---

### 4. Update Receipt

**Update receipt information (store, date, totals, items)**

```http
PUT /api/receipts/:id
Content-Type: application/json
```

**Path Parameters:**
```
id (required) - Receipt UUID
```

**Request Body:**
```json
{
  "storeName": "Walmart",
  "storeAddress": "456 New St",
  "storePhone": "555-5678",
  "receiptDate": "2024-01-15",
  "currency": "USD",
  "subtotal": 50.00,
  "tax": 4.00,
  "total": 54.00,
  "items": [
    {
      "id": "existing-item-uuid",  // Update existing item
      "name": "Whole Milk",
      "quantity": 2,
      "unitPrice": 4.50,
      "lineTotal": 9.00,
      "categoryName": "Groceries"
    },
    {
      // New item (no id)
      "name": "Eggs",
      "quantity": 1,
      "unitPrice": 3.50,
      "lineTotal": 3.50,
      "categoryName": "Groceries"
    }
  ]
}
```

**Response: 200 OK**
```json
{
  "id": "uuid",
  "store": {
    "id": "uuid",
    "name": "Walmart",
    "address": "456 New St",
    "phone": "555-5678"
  },
  "receiptDate": "2024-01-15",
  "currency": "USD",
  "subtotal": 50.00,
  "tax": 4.00,
  "total": 54.00,
  "status": "COMPLETED",
  "needsReview": false,
  "items": [...],
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Receipt not found
- `400 Bad Request`: Invalid data

**Example:**
```bash
curl -X PUT http://localhost:3000/api/receipts/uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Walmart",
    "total": 54.00,
    "items": [...]
  }'
```

---

### 5. Delete Receipt

**Delete a receipt and all its items**

```http
DELETE /api/receipts/:id
```

**Path Parameters:**
```
id (required) - Receipt UUID
```

**Response: 204 No Content**

**Error Responses:**
- `404 Not Found`: Receipt not found

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/receipts/uuid-here
```

---

## Stores Endpoints

### 1. Get All Stores

**Retrieve list of all stores**

```http
GET /api/stores
```

**Response: 200 OK**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Walmart",
      "address": "123 Main St",
      "phone": "555-1234",
      "receiptsCount": 45,
      "totalSpent": 2345.67
    },
    {
      "id": "uuid",
      "name": "Target",
      "address": "456 Oak Ave",
      "phone": "555-5678",
      "receiptsCount": 32,
      "totalSpent": 1876.54
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/stores
```

---

### 2. Get Store by ID

**Retrieve detailed information about a specific store**

```http
GET /api/stores/:id
```

**Path Parameters:**
```
id (required) - Store UUID
```

**Response: 200 OK**
```json
{
  "id": "uuid",
  "name": "Walmart",
  "address": "123 Main St",
  "phone": "555-1234",
  "receiptsCount": 45,
  "totalSpent": 2345.67,
  "recentReceipts": [
    {
      "id": "uuid",
      "receiptDate": "2024-01-15",
      "total": 49.14
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Store not found

**Example:**
```bash
curl http://localhost:3000/api/stores/uuid-here
```

---

## Categories Endpoints

### 1. Get All Categories

**Retrieve list of all categories**

```http
GET /api/categories
```

**Response: 200 OK**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Groceries",
      "description": "Food and beverages",
      "itemsCount": 234,
      "totalSpent": 3456.78
    },
    {
      "id": "uuid",
      "name": "Personal Care",
      "description": "Hygiene and beauty products",
      "itemsCount": 89,
      "totalSpent": 567.89
    },
    {
      "id": "uuid",
      "name": "Household",
      "description": "Cleaning and home supplies",
      "itemsCount": 67,
      "totalSpent": 345.67
    },
    {
      "id": "uuid",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "itemsCount": 12,
      "totalSpent": 789.00
    },
    {
      "id": "uuid",
      "name": "Clothing",
      "description": "Apparel and accessories",
      "itemsCount": 23,
      "totalSpent": 456.78
    },
    {
      "id": "uuid",
      "name": "Other",
      "description": "Miscellaneous items",
      "itemsCount": 45,
      "totalSpent": 234.56
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/categories
```

---

## Expenses Endpoints

### 1. Get Monthly Expenses

**Retrieve aggregated expenses grouped by month**

```http
GET /api/expenses/monthly
```

**Query Parameters:**
```
dateFrom  (optional) - Start date (YYYY-MM-DD)
dateTo    (optional) - End date (YYYY-MM-DD)
```

**Response: 200 OK**
```json
{
  "items": [
    {
      "month": "2024-01",
      "year": 2024,
      "monthName": "January",
      "total": 1234.56,
      "receiptsCount": 15,
      "itemsCount": 78,
      "avgPerReceipt": 82.30
    },
    {
      "month": "2024-02",
      "year": 2024,
      "monthName": "February",
      "total": 987.65,
      "receiptsCount": 12,
      "itemsCount": 65,
      "avgPerReceipt": 82.30
    }
  ],
  "summary": {
    "totalSpent": 2222.21,
    "totalReceipts": 27,
    "avgPerMonth": 1111.11,
    "avgPerReceipt": 82.30
  }
}
```

**Example:**
```bash
# Get expenses for 2024
curl "http://localhost:3000/api/expenses/monthly?dateFrom=2024-01-01&dateTo=2024-12-31"

# Get last 6 months
curl "http://localhost:3000/api/expenses/monthly?dateFrom=2024-06-01"
```

---

### 2. Get Expenses by Store

**Retrieve aggregated expenses grouped by store**

```http
GET /api/expenses/by-store
```

**Query Parameters:**
```
dateFrom  (optional) - Start date (YYYY-MM-DD)
dateTo    (optional) - End date (YYYY-MM-DD)
limit     (optional, default: 10) - Top N stores
```

**Response: 200 OK**
```json
{
  "items": [
    {
      "storeId": "uuid",
      "storeName": "Walmart",
      "total": 2345.67,
      "receiptsCount": 45,
      "avgPerReceipt": 52.13,
      "percentage": 45.5
    },
    {
      "storeId": "uuid",
      "storeName": "Target",
      "total": 1876.54,
      "receiptsCount": 32,
      "avgPerReceipt": 58.64,
      "percentage": 36.4
    }
  ],
  "summary": {
    "totalSpent": 5154.21,
    "totalStores": 8,
    "totalReceipts": 95
  }
}
```

**Example:**
```bash
# Get top 5 stores
curl "http://localhost:3000/api/expenses/by-store?limit=5"

# Get expenses by store for January 2024
curl "http://localhost:3000/api/expenses/by-store?dateFrom=2024-01-01&dateTo=2024-01-31"
```

---

### 3. Get Expenses by Category

**Retrieve aggregated expenses grouped by category**

```http
GET /api/expenses/by-category
```

**Query Parameters:**
```
dateFrom  (optional) - Start date (YYYY-MM-DD)
dateTo    (optional) - End date (YYYY-MM-DD)
```

**Response: 200 OK**
```json
{
  "items": [
    {
      "categoryId": "uuid",
      "categoryName": "Groceries",
      "total": 3456.78,
      "itemsCount": 234,
      "receiptsCount": 67,
      "percentage": 67.0
    },
    {
      "categoryId": "uuid",
      "categoryName": "Personal Care",
      "total": 567.89,
      "itemsCount": 89,
      "receiptsCount": 23,
      "percentage": 11.0
    },
    {
      "categoryId": "uuid",
      "categoryName": "Household",
      "total": 345.67,
      "itemsCount": 67,
      "receiptsCount": 18,
      "percentage": 6.7
    }
  ],
  "summary": {
    "totalSpent": 5154.21,
    "totalItems": 470,
    "totalReceipts": 95
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/expenses/by-category

# With date filter
curl "http://localhost:3000/api/expenses/by-category?dateFrom=2024-01-01&dateTo=2024-12-31"
```

---

### 4. Get Expenses Summary

**Retrieve overall expenses summary with key metrics**

```http
GET /api/expenses/summary
```

**Query Parameters:**
```
dateFrom  (optional) - Start date (YYYY-MM-DD)
dateTo    (optional) - End date (YYYY-MM-DD)
```

**Response: 200 OK**
```json
{
  "totalSpent": 15234.56,
  "totalReceipts": 145,
  "totalItems": 876,
  "avgPerReceipt": 105.07,
  "avgPerItem": 17.39,
  "topStore": {
    "id": "uuid",
    "name": "Walmart",
    "total": 5432.10,
    "percentage": 35.7
  },
  "topCategory": {
    "id": "uuid",
    "name": "Groceries",
    "total": 8765.43,
    "percentage": 57.5
  },
  "dateRange": {
    "from": "2024-01-01",
    "to": "2024-12-31",
    "daysCount": 365
  },
  "trends": {
    "thisMonth": 1234.56,
    "lastMonth": 1098.76,
    "change": 12.4,
    "changePercentage": 12.4
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/expenses/summary

# With date filter
curl "http://localhost:3000/api/expenses/summary?dateFrom=2024-01-01&dateTo=2024-06-30"
```

---

## Error Responses

All endpoints follow consistent error response format:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "receiptDate",
      "message": "receiptDate must be a valid ISO 8601 date string"
    }
  ]
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Receipt not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Data Types & Enums

### ReceiptStatus
```typescript
enum ReceiptStatus {
  PROCESSING = 'PROCESSING',       // Being processed by OCR/LLM
  COMPLETED = 'COMPLETED',         // Successfully processed
  FAILED = 'FAILED',               // Processing failed
  NEEDS_REVIEW = 'NEEDS_REVIEW'    // Completed but needs manual review
}
```

### Date Format
```
All dates are in ISO 8601 format:
- Date only: YYYY-MM-DD (e.g., "2024-01-15")
- DateTime: YYYY-MM-DDTHH:mm:ssZ (e.g., "2024-01-15T10:30:00Z")
```

### Currency Format
```
Decimal numbers with 2 decimal places
Example: 123.45
```

---

## Request/Response Examples

### Upload Receipt - Full Example

**Request:**
```bash
curl -X POST http://localhost:3000/api/receipts \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/receipt.jpg"
```

**Success Response (201):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "store": {
    "id": "store-uuid-1234",
    "name": "Walmart Supercenter",
    "address": "123 Main Street, Springfield",
    "phone": "(555) 123-4567"
  },
  "receiptDate": "2024-01-15",
  "currency": "USD",
  "subtotal": 45.50,
  "tax": 3.64,
  "total": 49.14,
  "status": "COMPLETED",
  "needsReview": false,
  "items": [
    {
      "id": "item-uuid-1",
      "name": "Great Value Whole Milk",
      "quantity": 2,
      "unitPrice": 3.99,
      "lineTotal": 7.98,
      "category": {
        "id": "cat-uuid-groceries",
        "name": "Groceries",
        "description": "Food and beverages"
      }
    },
    {
      "id": "item-uuid-2",
      "name": "Wonder Bread White",
      "quantity": 1,
      "unitPrice": 2.50,
      "lineTotal": 2.50,
      "category": {
        "id": "cat-uuid-groceries",
        "name": "Groceries",
        "description": "Food and beverages"
      }
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "File type not supported. Please upload jpg, jpeg, png, or pdf",
  "error": "Bad Request"
}
```

---

## Rate Limiting

- **Development**: No rate limits
- **Production**: 
  - Upload endpoint: 10 requests per minute
  - Other endpoints: 100 requests per minute

---

## Authentication (Optional - Future)

When authentication is implemented:

```http
Authorization: Bearer <jwt-token>
```

---

## Pagination Format

All paginated endpoints follow this structure:

**Request:**
```
?page=1&limit=20
```

**Response:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Testing with Postman

Import this collection: [Download Postman Collection](./postman-collection.json)

Or test manually:

1. **Upload Receipt**
   - Method: POST
   - URL: `http://localhost:3000/api/receipts`
   - Body: form-data, key="file", select image

2. **Get Receipts**
   - Method: GET
   - URL: `http://localhost:3000/api/receipts`

3. **Get Receipt Detail**
   - Method: GET
   - URL: `http://localhost:3000/api/receipts/{id}`

---

## WebSocket Events (Future Feature)

For real-time receipt processing status:

```javascript
const socket = io('http://localhost:3000');

socket.on('receipt:processing', (data) => {
  console.log('Receipt is being processed:', data);
});

socket.on('receipt:completed', (data) => {
  console.log('Receipt processed successfully:', data);
});

socket.on('receipt:failed', (data) => {
  console.log('Receipt processing failed:', data);
});
```

---

## Changelog

### Version 1.0 (Current)
- Initial API release
- Basic CRUD operations
- OCR + LLM integration
- Analytics endpoints

### Version 1.1 (Planned)
- Authentication
- User management
- Batch upload
- Export to CSV/PDF

---

**Last Updated**: 2024
**API Version**: 1.0
**Base URL**: `/api`






