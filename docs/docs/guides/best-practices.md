# Best Practices

Production-ready tips and best practices for the MCP Server.

## Development

### 1. Use Environment Variables

Never hard-code configuration:

```typescript
// ❌ Bad
const mongoUri = "mongodb://localhost:27017/waste";

// ✅ Good
const mongoUri = process.env.MONGODB_URI;
```

### 2. Validate Input Early

```typescript
// Validate before making API calls
function validateFacility(data) {
  if (!data.name || !data.shortCode || !data.location) {
    throw new Error('Missing required fields');
  }
  
  if (data.name.length < 3) {
    throw new Error('Name must be at least 3 characters');
  }
}
```

### 3. Handle Errors Gracefully

```typescript
async function safeOperation() {
  try {
    return await createFacility({...});
  } catch (error) {
    console.error('Operation failed:', error);
    // Return default or throw custom error
    return null;
  }
}
```

## Data Management

### 1. Use Consistent Naming

```typescript
// Facility codes
const facilityCode = `${region}-${type}-${number}`.toUpperCase();
// "NY-PROC-001", "CA-SORT-042"

// Contract codes
const contractCode = `WC-${year}-${producer.substring(0, 3).toUpperCase()}-${number}`;
// "WC-2025-GRE-001"
```

### 2. Validate References

Before creating related records:

```typescript
async function createInspectionSafely(data) {
  // Verify facility exists
  const facility = await getFacility(data.facilityId);
  if (!facility || facility.isError) {
    throw new Error('Facility not found');
  }
  
  return await createInspection(data);
}
```

### 3. Use Transactions for Related Operations

```typescript
async function createCompleteShipment(facilityData, contractData, shipmentData) {
  try {
    const facility = await createFacility(facilityData);
    const contract = await createContract(contractData);
    const shipment = await createShipment({
      ...shipmentData,
      facilityId: facility._id,
      contractId: contract._id
    });
    
    return { facility, contract, shipment };
  } catch (error) {
    // Consider cleanup/rollback
    console.error('Transaction failed:', error);
    throw error;
  }
}
```

## Performance

### 1. Batch Queries

```typescript
// ❌ Bad: Sequential queries
for (const id of facilityIds) {
  const facility = await getFacility(id);
  console.log(facility);
}

// ✅ Good: Parallel queries
const facilities = await Promise.all(
  facilityIds.map(id => getFacility(id))
);
```

### 2. Cache Frequently Accessed Data

```typescript
const facilityCache = new Map();

async function getCachedFacility(id) {
  if (facilityCache.has(id)) {
    return facilityCache.get(id);
  }
  
  const facility = await getFacility(id);
  facilityCache.set(id, facility);
  
  // Expire after 5 minutes
  setTimeout(() => facilityCache.delete(id), 5 * 60 * 1000);
  
  return facility;
}
```

### 3. Limit List Operations

```typescript
// Client-side pagination
function paginateResults(allResults, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    data: allResults.slice(start, end),
    page,
    pageSize,
    total: allResults.length,
    totalPages: Math.ceil(allResults.length / pageSize)
  };
}

const facilities = await listFacilities();
const page1 = paginateResults(facilities, 1, 20);
```

## Security

### 1. Validate ObjectIds

```typescript
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Always validate before queries
if (!isValidObjectId(facilityId)) {
  throw new Error('Invalid ID format');
}
```

### 2. Sanitize User Input

```typescript
function sanitizeString(input) {
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remove HTML tags
    .substring(0, 500);     // Limit length
}

const facility = await createFacility({
  name: sanitizeString(userInput.name),
  shortCode: sanitizeString(userInput.shortCode),
  location: sanitizeString(userInput.location)
});
```

### 3. Use HTTPS in Production

```typescript
// In production config
const serverUrl = process.env.NODE_ENV === 'production'
  ? 'https://api.example.com/sse'
  : 'http://localhost:3000/sse';
```

## Testing

### 1. Test Happy Paths

```javascript
test('create facility successfully', async () => {
  const result = await createFacility({
    name: "Test Facility",
    shortCode: "TST-001",
    location: "Test City"
  });
  
  expect(result._id).toBeDefined();
  expect(result.name).toBe("Test Facility");
});
```

### 2. Test Error Cases

```javascript
test('reject invalid facility data', async () => {
  await expect(
    createFacility({
      name: 123,  // Wrong type
      shortCode: "TST",
      location: "Test"
    })
  ).rejects.toThrow('Expected string');
});
```

### 3. Test Edge Cases

```javascript
test('handle empty list', async () => {
  const facilities = await listFacilities();
  expect(Array.isArray(facilities)).toBe(true);
});

test('handle not found', async () => {
  const result = await getFacility("000000000000000000000000");
  expect(result.isError).toBe(true);
});
```

## Monitoring

### 1. Log Important Operations

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'app.log' })
  ]
});

async function createFacilityWithLogging(data) {
  logger.info('Creating facility', { data });
  
  try {
    const result = await createFacility(data);
    logger.info('Facility created', { id: result._id });
    return result;
  } catch (error) {
    logger.error('Failed to create facility', { error: error.message, data });
    throw error;
  }
}
```

### 2. Track Performance Metrics

```typescript
async function timedOperation(operation, name) {
  const start = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - start;
    
    console.log(`${name} took ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`Slow operation: ${name}`);
    }
    
    return result;
  } catch (error) {
    console.error(`${name} failed after ${Date.now() - start}ms`);
    throw error;
  }
}

// Usage
const facility = await timedOperation(
  () => createFacility({...}),
  'createFacility'
);
```

### 3. Health Checks

```typescript
async function healthCheck() {
  try {
    const facilities = await listFacilities();
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Documentation

### 1. Document Complex Logic

```typescript
/**
 * Creates a complete waste tracking workflow.
 * 
 * This function:
 * 1. Creates or retrieves a facility
 * 2. Creates or retrieves a contract
 * 3. Creates a shipment linking both
 * 4. Performs an inspection
 * 5. Records any contaminants
 * 
 * @param {Object} params - Workflow parameters
 * @param {string} params.facilityName - Name of facility
 * @param {string} params.producerName - Waste producer
 * @returns {Promise<Object>} Complete workflow result
 */
async function processWasteShipment(params) {
  // Implementation
}
```

### 2. Use TypeScript Types

```typescript
interface FacilityData {
  name: string;
  shortCode: string;
  location: string;
}

interface CreateFacilityResult {
  _id: string;
  name: string;
  shortCode: string;
  location: string;
  __v: number;
}

async function createFacility(data: FacilityData): Promise<CreateFacilityResult> {
  // Implementation
}
```

## Deployment

### 1. Use Environment-Specific Configs

```typescript
const config = {
  development: {
    mongoUri: 'mongodb://localhost:27017/waste-dev',
    port: 3000,
    logLevel: 'debug'
  },
  production: {
    mongoUri: process.env.MONGODB_URI,
    port: process.env.PORT || 3000,
    logLevel: 'error'
  }
};

const env = process.env.NODE_ENV || 'development';
export default config[env];
```

### 2. Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Close database connections
  await mongoose.connection.close();
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

### 3. Health Endpoint

Always expose a health check:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Common Pitfalls

### ❌ Not Checking for Errors

```typescript
// Bad
const facility = await getFacility(id);
console.log(facility.name);  // Might fail if not found
```

### ✅ Always Check

```typescript
// Good
const facility = await getFacility(id);
if (facility.isError) {
  console.error('Facility not found');
  return;
}
console.log(facility.name);
```

### ❌ Forgetting ISO 8601 Format

```typescript
// Bad
detection_time: "11/01/2025 10:30"
```

### ✅ Use ISO 8601

```typescript
// Good
detection_time: new Date().toISOString()
// "2025-11-01T10:30:00.000Z"
```

### ❌ Case-Sensitive Enums

```typescript
// Bad
explosive_level: "HIGH"  // Will fail
```

### ✅ Use Exact Values

```typescript
// Good
explosive_level: "high"  // Correct
```

## Next Steps

- **[Workflows](/guides/workflows)** - Common workflows
- **[Examples](/examples/complete-workflows)** - Real-world examples
- **[Troubleshooting](/troubleshooting/common-issues)** - Debug issues

---

**Ready for production?** Review [Deployment Checklist](/troubleshooting/common-issues).

