# Core Services Foundation

This directory contains the foundational services that provide common functionality across the FibreFlow React application.

## Services Overview

### 1. BaseService
**File**: `BaseService.ts`
- Abstract base class for all application services
- Standardized error handling and response formats
- Retry mechanisms and timeout wrappers
- Health status monitoring

### 2. ApiClient  
**File**: `ApiClient.ts`
- HTTP client with automatic authentication
- Request/response interceptors
- Error transformation and handling
- Consistent API response format

### 3. NotificationService
**File**: `NotificationService.ts`
- Centralized user feedback system
- Success, error, warning, and info notifications
- Operation helpers for common scenarios
- Integration with react-hot-toast

### 4. StorageService
**File**: `StorageService.ts`
- Unified storage management (localStorage, sessionStorage, memory)
- TTL support for automatic expiration
- Namespacing for data organization
- Encryption and compression placeholders

### 5. ValidationService
**File**: `ValidationService.ts`
- Reusable validation rules and schemas
- Common validators (email, phone, password, etc.)
- Field and object validation
- User-friendly error formatting

### 6. FormatterService
**File**: `FormatterService.ts`
- Consistent data formatting across the app
- Currency, date, number, and text formatting
- Localization support
- Singapore-specific defaults

## Usage Examples

### Using BaseService
```typescript
import { BaseService, ServiceResponse } from '@/services/core';

class MyService extends BaseService {
  constructor() {
    super('MyService');
  }

  async getHealthStatus(): Promise<ServiceResponse<{ status: string }>> {
    try {
      // Health check logic
      return this.success({ status: 'healthy' });
    } catch (error) {
      return this.handleError(error, 'getHealthStatus');
    }
  }
}
```

### Using NotificationService
```typescript
import { notificationService } from '@/services/core';

// Success notification
notificationService.operationSuccess('create', 'project');

// Error notification  
notificationService.operationError('delete', error, 'staff member');

// Custom notification
notificationService.info('Data synchronized successfully');
```

### Using ValidationService
```typescript
import { validationService } from '@/services/core';

const emailValidation = validationService.validateField(
  'user@example.com',
  [
    validationService.required(),
    validationService.email()
  ]
);

if (!emailValidation.isValid) {
  console.log(emailValidation.errors);
}
```

### Using FormatterService
```typescript
import { formatterService } from '@/services/core';

// Currency formatting (SGD default)
const price = formatterService.currency(1250.50); // "SGD 1,250.50"

// Date formatting
const date = formatterService.date(new Date()); // "Dec 21, 2024"

// Relative time
const time = formatterService.relativeTime(yesterday); // "1 day ago"
```

### Using StorageService
```typescript
import { storageService } from '@/services/core';

// Store with TTL
await storageService.set('user-prefs', preferences, 'local', {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  namespace: 'user'
});

// Retrieve
const prefs = await storageService.get('user-prefs', 'local', {
  namespace: 'user'
});
```

## Integration Notes

### Error Handling Strategy
All services follow a consistent error handling pattern:
1. Try/catch at service method level
2. Transform errors to user-friendly messages
3. Return ServiceResponse format
4. Log errors for debugging

### Response Format
Standard service response format:
```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
```

### Authentication Integration
ApiClient automatically:
- Adds Firebase auth tokens to requests
- Handles token refresh
- Redirects on authentication failures

### Notification Integration
NotificationService provides:
- Operation-specific helpers
- Consistent styling and positioning
- Error/success state management
- Promise-based notifications

## Future Enhancements

1. **Encryption**: Implement proper encryption for StorageService
2. **Compression**: Add data compression for large storage items  
3. **Caching**: Add intelligent caching layer to ApiClient
4. **Metrics**: Add performance monitoring to BaseService
5. **Validation**: Extend validation rules for business-specific cases
6. **Formatting**: Add more locale-specific formatters

## Dependencies

- `axios` - HTTP client
- `react-hot-toast` - Notifications
- `firebase/auth` - Authentication
- Native browser APIs - Storage

---

*This foundation enables consistent, maintainable, and robust service architecture across the FibreFlow React application.*