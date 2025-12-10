# 🎨 Frontend Architecture - Receipt Tracker

## Overview

This document describes the frontend architecture using a **Feature-Based Architecture** pattern with React, TypeScript, and modern best practices.

---

## Architecture Pattern: Feature-Based

Instead of organizing by technical layers (components/, hooks/, etc.), we organize by features (upload/, receipts/, dashboard/). Each feature is self-contained with its own components, hooks, and API logic.

### Benefits
- ✅ **Scalability**: Easy to add new features
- ✅ **Maintainability**: Related code stays together
- ✅ **Team Collaboration**: Multiple developers can work on different features
- ✅ **Code Discovery**: Easy to find feature-related code

---

## Project Structure

```
receipt-tracker-frontend/
├── public/                    # Static assets
│
├── src/
│   ├── features/             # Feature modules
│   │   ├── upload/
│   │   ├── receipts/
│   │   ├── dashboard/
│   │   └── auth/
│   │
│   ├── components/           # Shared components
│   │   ├── ui/              # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   └── common/          # Custom shared components
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── lib/                 # Utilities and libraries
│   │   ├── api/
│   │   │   ├── client.ts         # Axios instance
│   │   │   └── queryClient.ts    # React Query config
│   │   ├── hooks/                # Shared hooks
│   │   │   └── useDebounce.ts
│   │   └── utils/                # Helper functions
│   │       ├── utils.ts
│   │       ├── formatters.ts
│   │       └── validators.ts
│   │
│   ├── store/               # Global state (Zustand)
│   │   ├── filters.store.ts
│   │   └── ui.store.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── receipt.types.ts
│   │   ├── store.types.ts
│   │   └── api.types.ts
│   │
│   ├── routes/              # Route configuration
│   │   └── index.tsx
│   │
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Feature Structure

Each feature follows this structure:

```
feature-name/
├── components/              # Feature-specific components
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── index.ts
│
├── hooks/                   # Feature-specific hooks
│   ├── useFeatureData.ts
│   ├── useFeatureMutation.ts
│   └── index.ts
│
├── api/                     # API calls for this feature
│   ├── featureApi.ts
│   └── index.ts
│
├── types/                   # Feature-specific types
│   └── feature.types.ts
│
├── utils/                   # Feature utilities (if needed)
│   └── helpers.ts
│
└── FeaturePage.tsx          # Main page component
```

---

## Features Details

### 1. Upload Feature 📤

**Purpose**: Upload receipt images for processing

**Structure**:
```
upload/
├── components/
│   ├── UploadForm.tsx           # Main form container
│   ├── DropZone.tsx             # Drag & drop area
│   ├── ImagePreview.tsx         # Show uploaded image
│   ├── ProcessingStatus.tsx    # Show upload/process status
│   └── index.ts
│
├── hooks/
│   ├── useUploadReceipt.ts      # Upload mutation
│   └── index.ts
│
├── api/
│   └── uploadReceipt.ts         # API function
│
└── UploadPage.tsx               # Main page
```

#### Components

**UploadForm.tsx**
```tsx
interface UploadFormProps {
  onSuccess?: (receiptId: string) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate, isPending, isError, error } = useUploadReceipt();
  
  const handleSubmit = () => {
    if (selectedFile) {
      mutate(selectedFile, {
        onSuccess: (data) => {
          onSuccess?.(data.id);
          navigate(`/receipts/${data.id}`);
        },
      });
    }
  };
  
  return (
    <div>
      <DropZone onFileSelect={setSelectedFile} />
      {selectedFile && <ImagePreview file={selectedFile} />}
      <Button onClick={handleSubmit} disabled={!selectedFile || isPending}>
        {isPending ? 'Processing...' : 'Upload Receipt'}
      </Button>
      {isError && <ErrorMessage error={error} />}
    </div>
  );
};
```

**DropZone.tsx**
```tsx
interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
    setIsDragging(false);
  };
  
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn("border-2 border-dashed rounded-lg p-8", {
        "border-primary": isDragging,
        "border-gray-300": !isDragging,
      })}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
      />
      <p>Drag & drop or click to select image</p>
    </div>
  );
};
```

#### Hooks

**useUploadReceipt.ts**
```tsx
export const useUploadReceipt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: uploadReceipt,
    onSuccess: (data) => {
      // Invalidate receipts list
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      
      // Add to cache
      queryClient.setQueryData(['receipt', data.id], data);
      
      toast.success('Receipt uploaded successfully!');
    },
    onError: (error) => {
      toast.error('Failed to upload receipt');
      console.error(error);
    },
  });
};
```

---

### 2. Receipts Feature 🧾

**Purpose**: View, manage, and edit receipts

**Structure**:
```
receipts/
├── components/
│   ├── ReceiptList.tsx          # List with pagination
│   ├── ReceiptCard.tsx          # Card in list
│   ├── ReceiptDetail.tsx        # Detail view
│   ├── ItemsTable.tsx           # Editable items table
│   ├── ReceiptFilters.tsx       # Date/store filters
│   ├── EditItemModal.tsx        # Edit single item
│   └── index.ts
│
├── hooks/
│   ├── useReceipts.ts           # Fetch list
│   ├── useReceipt.ts            # Fetch single
│   ├── useUpdateReceipt.ts      # Update mutation
│   ├── useDeleteReceipt.ts      # Delete mutation
│   └── index.ts
│
├── api/
│   └── receiptsApi.ts           # All API functions
│
├── types/
│   └── receipts.types.ts
│
├── ReceiptsPage.tsx             # List page
└── ReceiptDetailPage.tsx        # Detail page
```

#### Components

**ReceiptList.tsx**
```tsx
export const ReceiptList: React.FC = () => {
  const filters = useFiltersStore();
  const { data, isLoading, isError } = useReceipts(filters);
  
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;
  if (!data?.items.length) return <EmptyState />;
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.map((receipt) => (
          <ReceiptCard key={receipt.id} receipt={receipt} />
        ))}
      </div>
      <Pagination {...data.pagination} />
    </div>
  );
};
```

**ReceiptCard.tsx**
```tsx
interface ReceiptCardProps {
  receipt: Receipt;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  const navigate = useNavigate();
  
  return (
    <Card
      onClick={() => navigate(`/receipts/${receipt.id}`)}
      className="cursor-pointer hover:shadow-lg transition"
    >
      <CardHeader>
        <CardTitle>{receipt.store.name}</CardTitle>
        <CardDescription>
          {formatDate(receipt.receiptDate)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          ${receipt.total.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          {receipt.items.length} items
        </p>
        {receipt.needsReview && (
          <Badge variant="warning">Needs Review</Badge>
        )}
      </CardContent>
    </Card>
  );
};
```

**ItemsTable.tsx**
```tsx
interface ItemsTableProps {
  items: ReceiptItem[];
  receiptId: string;
  isEditable?: boolean;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  receiptId,
  isEditable = false,
}) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Category</TableHead>
          {isEditable && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.quantity || '-'}</TableCell>
            <TableCell>${item.unitPrice?.toFixed(2) || '-'}</TableCell>
            <TableCell>${item.lineTotal?.toFixed(2) || '-'}</TableCell>
            <TableCell>
              <Badge>{item.category.name}</Badge>
            </TableCell>
            {isEditable && (
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingItem(item.id)}
                >
                  Edit
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

#### Hooks

**useReceipts.ts**
```tsx
interface UseReceiptsParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  storeId?: string;
}

export const useReceipts = (params: UseReceiptsParams = {}) => {
  return useQuery({
    queryKey: ['receipts', params],
    queryFn: () => fetchReceipts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**useReceipt.ts**
```tsx
export const useReceipt = (id: string) => {
  return useQuery({
    queryKey: ['receipt', id],
    queryFn: () => fetchReceiptById(id),
    enabled: !!id,
  });
};
```

**useUpdateReceipt.ts**
```tsx
export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReceiptDto }) =>
      updateReceipt(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.setQueryData(['receipt', variables.id], data);
      toast.success('Receipt updated successfully!');
    },
  });
};
```

---

### 3. Dashboard Feature 📊

**Purpose**: Analytics and visualizations

**Structure**:
```
dashboard/
├── components/
│   ├── MonthlyChart.tsx         # Line/bar chart
│   ├── StoreChart.tsx           # Pie chart
│   ├── CategoryChart.tsx        # Bar chart
│   ├── SummaryCards.tsx         # Statistics cards
│   ├── DateRangeFilter.tsx      # Filter component
│   └── index.ts
│
├── hooks/
│   ├── useMonthlyExpenses.ts
│   ├── useExpensesByStore.ts
│   ├── useExpensesByCategory.ts
│   └── index.ts
│
├── api/
│   └── expensesApi.ts
│
└── DashboardPage.tsx
```

#### Components

**MonthlyChart.tsx**
```tsx
export const MonthlyChart: React.FC = () => {
  const { dateFrom, dateTo } = useFiltersStore();
  const { data, isLoading } = useMonthlyExpenses({ dateFrom, dateTo });
  
  if (isLoading) return <Skeleton className="h-[300px]" />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

**SummaryCards.tsx**
```tsx
export const SummaryCards: React.FC = () => {
  const { data: monthly } = useMonthlyExpenses();
  
  const totalSpent = monthly?.reduce((sum, m) => sum + m.total, 0) || 0;
  const avgPerMonth = totalSpent / (monthly?.length || 1);
  const receiptCount = monthly?.reduce((sum, m) => sum + m.count, 0) || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Spent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Avg per Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${avgPerMonth.toFixed(2)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{receiptCount}</p>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## State Management

### React Query (Server State)

Used for all API data fetching and caching.

**Configuration**:
```typescript
// lib/api/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**Usage Pattern**:
```typescript
// Read data
const { data, isLoading, error } = useQuery({
  queryKey: ['receipts', filters],
  queryFn: () => fetchReceipts(filters),
});

// Mutate data
const { mutate } = useMutation({
  mutationFn: createReceipt,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['receipts'] });
  },
});
```

### Zustand (UI State)

Used for UI state like filters, preferences, etc.

**Example Store**:
```typescript
// store/filters.store.ts
interface FiltersStore {
  dateFrom: string | null;
  dateTo: string | null;
  storeId: string | null;
  setDateFrom: (date: string | null) => void;
  setDateTo: (date: string | null) => void;
  setStoreId: (id: string | null) => void;
  clearFilters: () => void;
}

export const useFiltersStore = create<FiltersStore>((set) => ({
  dateFrom: null,
  dateTo: null,
  storeId: null,
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  setStoreId: (id) => set({ storeId: id }),
  clearFilters: () => set({ dateFrom: null, dateTo: null, storeId: null }),
}));
```

---

## API Layer

### HTTP Client

```typescript
// lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

### API Functions Pattern

```typescript
// features/receipts/api/receiptsApi.ts
export const fetchReceipts = async (params: FetchReceiptsParams) => {
  const { data } = await apiClient.get('/api/receipts', { params });
  return data;
};

export const fetchReceiptById = async (id: string) => {
  const { data } = await apiClient.get(`/api/receipts/${id}`);
  return data;
};

export const updateReceipt = async (id: string, dto: UpdateReceiptDto) => {
  const { data } = await apiClient.put(`/api/receipts/${id}`, dto);
  return data;
};

export const deleteReceipt = async (id: string) => {
  await apiClient.delete(`/api/receipts/${id}`);
};

export const uploadReceipt = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await apiClient.post('/api/receipts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return data;
};
```

---

## Routing

```typescript
// routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'receipts', element: <ReceiptsPage /> },
      { path: 'receipts/:id', element: <ReceiptDetailPage /> },
    ],
  },
]);
```

---

## TypeScript Types

```typescript
// types/receipt.types.ts
export interface Receipt {
  id: string;
  store: Store;
  receiptDate: string;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number;
  status: ReceiptStatus;
  needsReview: boolean;
  items: ReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  lineTotal: number | null;
  category: Category;
}

export interface Store {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export enum ReceiptStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}
```

---

## Best Practices

### Component Design
- ✅ Use functional components with hooks
- ✅ Keep components small and focused
- ✅ Extract reusable logic to custom hooks
- ✅ Use TypeScript for type safety
- ✅ Implement proper error boundaries

### Performance
- ✅ Use React.memo for expensive components
- ✅ Implement virtualization for long lists
- ✅ Lazy load routes and components
- ✅ Optimize images
- ✅ Use proper React Query cache strategies

### Accessibility
- ✅ Use semantic HTML
- ✅ Add ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Color contrast compliance

### Testing
- ✅ Unit tests for utilities
- ✅ Component tests with React Testing Library
- ✅ Integration tests for features
- ✅ E2E tests with Playwright

---

## Development Workflow

### 1. Create Feature
```bash
mkdir -p src/features/feature-name/{components,hooks,api}
touch src/features/feature-name/FeaturePage.tsx
```

### 2. Implement Components
- Start with page component
- Break down into smaller components
- Add to components/

### 3. Add API Integration
- Create API functions in api/
- Create custom hooks in hooks/
- Connect to components

### 4. Add Types
- Define interfaces
- Export from types/

### 5. Test
- Write component tests
- Write hook tests
- Manual testing

---

## Next Steps

1. Setup project with Vite
2. Install dependencies (React Query, Zustand, etc.)
3. Configure Tailwind CSS
4. Setup Shadcn/ui
5. Implement features one by one

---

**Last Updated**: 2024
**Version**: 1.0






