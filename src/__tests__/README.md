# Backend Tests

This directory contains all backend unit tests for the Tariky Course Management Platform.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Files

### 1. `userController.test.ts`
Tests for user management endpoints:
- Creating/updating users from Clerk
- Getting user profiles
- Completing onboarding
- Checking profile completion status

**Coverage**: 13 test cases

### 2. `courseEnrollment.test.ts`
Tests for course enrollment functionality:
- Enrollment creation
- User validation
- Course validation
- Duplicate enrollment prevention
- Payment link inclusion

**Coverage**: 10 test cases

### 3. `validation.test.ts`
Tests for data validation:
- Ethiopian phone number format
- Required field validation
- User creation data
- Onboarding data
- Enrollment eligibility
- Data sanitization

**Coverage**: 18 test cases

## Total Coverage

**41 automated unit tests** covering:
- User management
- Course enrollment
- Data validation
- Error handling

## Test Configuration

**Framework**: Jest + TypeScript (ts-jest)
**Mocking**: Prisma client is mocked for all database operations
**Timeout**: 10 seconds per test
**Setup**: `setup.ts` runs before all tests

## Writing New Tests

### Template

```typescript
import { Request, Response } from 'express';
import { YourController } from '../controllers/yourController';
import prisma from '../utils/prisma';

// Mock Prisma
jest.mock('../utils/prisma');

describe('YourController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should do something', async () => {
    // Arrange
    mockRequest = { body: { test: 'data' } };

    // Act
    await YourController.method(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
```

## Best Practices

1. **Test Independence**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Always mock Prisma, external APIs
5. **Test Edge Cases**: Include error scenarios

## CI/CD Integration

Tests run automatically on:
- Push to main branch
- Pull request creation
- Before deployment

## Coverage Goals

- **Target**: 80%+ code coverage
- **Current**: Check with `npm run test:coverage`

## Need Help?

See `TESTING_GUIDE.md` in the project root for comprehensive testing documentation.
