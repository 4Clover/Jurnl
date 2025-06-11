# Logger Usage Examples

## Server-Side Logger

### Basic Usage

```typescript
import { logger } from '$lib/server/logger';

// Basic logging
logger.debug('Debug information');
logger.info('Application started');
logger.warn('Deprecation warning');
logger.error('Error occurred', new Error('Something went wrong'));
logger.fatal('Critical error', error);

// With metadata
logger.info('User logged in', { 
  userId: '123', 
  loginMethod: 'google' 
});

// Performance timing
const timer = logger.startTimer();
// ... perform operation ...
timer.end('Database query completed', { 
  query: 'SELECT * FROM users' 
});
```

### Service Integration Example

```typescript
// From friend.service.ts
export async function addFriendFromForm(
    event: RequestEvent,
    formData: FormData,
): Promise<FriendResponse> {
    const context = getContext();
    const log = logger.child({ 
        ...context,
        service: 'FriendService',
        operation: 'addFriend'
    });
    const timer = log.startTimer();

    // ... operation logic ...

    timer.end('Friend added successfully', {
        currentUserId,
        friendId: friend._id.toString(),
        friendUsername
    });
}
```

## Client-Side Logger

### Basic Usage in Svelte Components

```typescript
import { logger } from '$lib/client/logger';

// In component script
try {
    const response = await fetch('/api/journals', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Failed to create journal');
    }
    
    logger.info('Journal created successfully', { 
        journalId: response.data.id 
    });
} catch (error) {
    logger.error('Failed to create journal', error, {
        context: { formData: data }
    });
}
```

### Global Error Handler

```typescript
// In app.html or root layout
import { installGlobalErrorHandler } from '$lib/client/logger';

// Install handlers for uncaught errors
installGlobalErrorHandler();
```

## Console Output Examples

### Development Mode (with colors)

```
🔵 [10:23:45] DEBUG Route mapped requestId="abc-123" method=GET path=/journals file=src/routes/journals/+page.svelte
🟢 [10:23:45] INFO  Listed 5 Journal resources duration=23ms requestId="abc-123"
🟡 [10:23:46] WARN  Validation failed for Journal creation requestId="def-456" errors=[...]
🔴 [10:23:47] ERROR Failed to create Journal resource requestId="ghi-789"
Error: Duplicate key error
    at Journal.create (...)
🟣 [10:23:48] FATAL Unhandled server error errorId="xyz-999" route=/api/journals
```

### Production Mode (JSON format)

```json
{"level":"info","message":"User logged in","timestamp":"2024-01-15T10:23:45.123Z","context":{"requestId":"abc-123","userId":"user-456","ip":"192.168.1.1"},"metadata":{"loginMethod":"google"}}
```

## Configuration

### Environment Variables

```bash
# Set log level
LOG_LEVEL=debug  # debug, info, warn, error, fatal

# Set output format
LOG_FORMAT=json  # json, pretty

# Enable/disable colors
LOG_COLORS=true  # true, false, auto

# Performance logging
LOG_PERFORMANCE=true
```

### Programmatic Configuration

```typescript
import { createLogger } from '$lib/server/logger';

const customLogger = createLogger({
    level: 'warn',
    format: 'json',
    colors: false,
    performanceLogging: true
});
```

## Benefits

1. **Structured Logging**: All logs include context, making debugging easier
2. **Color Coding**: Visual distinction between log levels in development
3. **Performance Tracking**: Built-in timing for operations
4. **Request Correlation**: Automatic request ID tracking across logs
5. **Zero Dependencies**: No external packages required
6. **Production Ready**: JSON format for log aggregation services