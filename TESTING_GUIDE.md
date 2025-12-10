# Testing Guide

Complete guide for running unit and E2E tests for both backend and frontend.

## 📋 Overview

### Backend Tests
- **Unit Tests**: Jest + NestJS Testing
- **E2E Tests**: Jest + Supertest

### Frontend Tests
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright

## 🚀 Backend Testing

### Unit Tests

```bash
# Run all unit tests
cd receipt-tracker-backend
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:cov

# Run specific test file
npm test -- app.service.spec.ts
```

### E2E Tests

```bash
# Run E2E tests
cd receipt-tracker-backend
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e -- --watch
```

### Test Structure

```
receipt-tracker-backend/
├── src/
│   ├── app.service.spec.ts    # Unit test example
│   └── ...
└── test/
    └── app.e2e-spec.ts        # E2E test example
```

### Writing Backend Tests

**Unit Test Example:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

**E2E Test Example:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('YourController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/endpoint')
      .expect(200);
  });
});
```

## 🎨 Frontend Testing

### Unit Tests

```bash
# Run all unit tests
cd receipt-tracker-frontend
npm test

# Run with UI
npm run test:ui

# Run once (CI mode)
npm run test:run

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
cd receipt-tracker-frontend
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test
npx playwright test e2e/example.spec.ts
```

### Test Structure

```
receipt-tracker-frontend/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       └── Example.test.tsx
│   └── test/
│       ├── setup.ts
│       └── utils/
│           └── test-utils.tsx
└── e2e/
    └── example.spec.ts
```

### Writing Frontend Tests

**Unit Test Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils/test-utils';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

**E2E Test Example:**
```typescript
import { test, expect } from '@playwright/test';

test('user can upload receipt', async ({ page }) => {
  await page.goto('/upload');
  await page.setInputFiles('input[type="file"]', 'path/to/receipt.jpg');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## 📊 Coverage Reports

### Backend Coverage

```bash
cd receipt-tracker-backend
npm run test:cov
```

Coverage report will be in `coverage/` directory.

### Frontend Coverage

```bash
cd receipt-tracker-frontend
npm run test:coverage
```

Coverage report will be in `coverage/` directory.

## 🛠️ Using Make Commands

```bash
# Run all backend tests
make test

# Run backend tests in watch mode
make test-watch

# Run backend E2E tests
make test-e2e

# Run frontend tests (from root)
cd receipt-tracker-frontend && npm test
```

## 📝 Best Practices

### Backend
1. **Mock external dependencies** (databases, APIs)
2. **Use test database** for E2E tests
3. **Clean up after tests** (beforeEach/afterEach)
4. **Test edge cases** and error scenarios
5. **Keep tests isolated** and independent

### Frontend
1. **Use test-utils** for consistent rendering
2. **Mock API calls** with MSW or Vitest mocks
3. **Test user interactions** with @testing-library/user-event
4. **Test accessibility** with jest-dom matchers
5. **Keep components testable** (small, focused)

## 🐛 Troubleshooting

### Backend Tests

**Issue: Database connection in tests**
```typescript
// Use test database or in-memory database
const module: TestingModule = await Test.createTestingModule({
  // ... your config
})
  .overrideProvider(getRepositoryToken(YourEntity))
  .useValue(mockRepository)
  .compile();
```

### Frontend Tests

**Issue: Module not found**
```typescript
// Check vitest.config.ts aliases
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

**Issue: Playwright browsers not installed**
```bash
npx playwright install
```

## 📚 Resources

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)







