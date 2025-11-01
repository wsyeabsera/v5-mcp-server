# Error Handling

Learn how to handle errors gracefully when working with the MCP Server.

## Error Response Format

All errors follow the MCP standard format:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Error message here"
    }],
    "isError": true
  },
  "id": 1
}
```

## Error Types

### 1. Validation Errors

Occur when input doesn't match the schema.

**Example**:
```javascript
// Wrong type
await createFacility({
  name: 123,  // Should be string
  shortCode: "TST-001",
  location: "Test"
});
```

**Error**:
```
Error creating facility: Expected string, received number
```

**How to Handle**:
```javascript
try {
  await createFacility(data);
} catch (error) {
  if (error.message.includes('Expected string')) {
    console.error('Type validation failed');
    // Fix data types
  }
}
```

### 2. Not Found Errors

Occur when a record doesn't exist.

**Example**:
```javascript
await getFacility("invalid-id");
```

**Error**:
```
Facility not found
```

**How to Handle**:
```javascript
const result = await getFacility(id);

if (result.isError && result.content[0].text.includes('not found')) {
  console.log('Record does not exist');
  // Create new record or use default
}
```

### 3. Database Errors

Occur when MongoDB operations fail.

**Example**:
```javascript
// MongoDB connection lost
await createFacility({...});
```

**Error**:
```
Error creating facility: MongoNetworkError: connection refused
```

**How to Handle**:
```javascript
try {
  await createFacility(data);
} catch (error) {
  if (error.message.includes('Mongo')) {
    console.error('Database error:', error);
    // Retry or alert admin
  }
}
```

### 4. Invalid ObjectId Errors

Occur when ObjectId format is invalid.

**Example**:
```javascript
await getFacility("abc");  // Invalid format
```

**Error**:
```
Error getting facility: Cast to ObjectId failed
```

**How to Handle**:
```javascript
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

if (!isValidObjectId(facilityId)) {
  throw new Error('Invalid ID format');
}

await getFacility(facilityId);
```

## Error Handling Patterns

### Pattern 1: Try-Catch

```javascript
async function safeFacilityCreate(data) {
  try {
    const facility = await createFacility(data);
    return { success: true, data: facility };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Pattern 2: Error Checking

```javascript
async function checkAndCreate(data) {
  const result = await createFacility(data);
  
  if (result.isError) {
    console.error('Creation failed:', result.content[0].text);
    return null;
  }
  
  return JSON.parse(result.content[0].text);
}
```

### Pattern 3: Retry Logic

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Usage
const facility = await retryOperation(() => 
  createFacility({ name: "Test", shortCode: "TST", location: "Test" })
);
```

### Pattern 4: Fallback Values

```javascript
async function getFacilityOrDefault(id) {
  try {
    return await getFacility(id);
  } catch (error) {
    return {
      _id: id,
      name: "Unknown Facility",
      shortCode: "UNKNOWN",
      location: "Unknown"
    };
  }
}
```

## Validation Before Requests

### Validate Data Types

```javascript
function validateFacilityData(data) {
  const errors = [];
  
  if (typeof data.name !== 'string') {
    errors.push('name must be a string');
  }
  
  if (typeof data.shortCode !== 'string') {
    errors.push('shortCode must be a string');
  }
  
  if (typeof data.location !== 'string') {
    errors.push('location must be a string');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

// Usage
validateFacilityData(data);
await createFacility(data);
```

### Validate Enums

```javascript
function validateHazardLevel(level) {
  const validLevels = ['low', 'medium', 'high'];
  
  if (!validLevels.includes(level)) {
    throw new Error(`Invalid level: ${level}. Must be one of: ${validLevels.join(', ')}`);
  }
}

// Usage
validateHazardLevel(explosiveLevel);
await createContaminant({
  explosive_level: explosiveLevel,
  // ...
});
```

### Validate Dates

```javascript
function validateISO8601(dateString) {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  
  return date.toISOString();
}

// Usage
const validDate = validateISO8601(userInput);
await createShipment({
  entry_timestamp: validDate,
  // ...
});
```

## Common Error Scenarios

### Scenario 1: Creating Duplicate Records

```javascript
async function createUniqueShortCode(baseCode) {
  let code = baseCode;
  let counter = 1;
  
  while (true) {
    const facilities = await listFacilities();
    const exists = facilities.some(f => f.shortCode === code);
    
    if (!exists) {
      return code;
    }
    
    code = `${baseCode}-${counter++}`;
  }
}

// Usage
const uniqueCode = await createUniqueShortCode("FAC");
await createFacility({
  name: "New Facility",
  shortCode: uniqueCode,
  location: "City"
});
```

### Scenario 2: Handling Missing References

```javascript
async function createShipmentSafely(data) {
  // Verify facility exists
  try {
    await getFacility(data.facilityId);
  } catch (error) {
    throw new Error(`Facility ${data.facilityId} not found. Create facility first.`);
  }
  
  // Verify contract exists
  try {
    await getContract(data.contractId);
  } catch (error) {
    throw new Error(`Contract ${data.contractId} not found. Create contract first.`);
  }
  
  // Safe to create
  return await createShipment(data);
}
```

### Scenario 3: Batch Operation Errors

```javascript
async function batchCreateWithErrorHandling(items) {
  const results = {
    successful: [],
    failed: []
  };
  
  for (const item of items) {
    try {
      const result = await createFacility(item);
      results.successful.push({ item, result });
    } catch (error) {
      results.failed.push({ item, error: error.message });
    }
  }
  
  return results;
}
```

## Error Logging

### Simple Logging

```javascript
function logError(operation, error, context = {}) {
  console.error({
    timestamp: new Date().toISOString(),
    operation,
    error: error.message,
    context
  });
}

// Usage
try {
  await createFacility(data);
} catch (error) {
  logError('createFacility', error, { data });
  throw error;
}
```

### Structured Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log' })
  ]
});

// Usage
try {
  await createFacility(data);
} catch (error) {
  logger.error('Failed to create facility', {
    error: error.message,
    data,
    stack: error.stack
  });
  throw error;
}
```

## Testing Error Scenarios

```javascript
// Test invalid data
it('should reject invalid facility data', async () => {
  const result = await createFacility({
    name: 123,  // Wrong type
    shortCode: "TST",
    location: "Test"
  });
  
  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain('Expected string');
});

// Test not found
it('should handle missing record', async () => {
  const result = await getFacility("000000000000000000000000");
  
  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain('not found');
});
```

## Next Steps

- **[Best Practices](/guides/best-practices)** - Production tips
- **[Troubleshooting](/troubleshooting/common-issues)** - Common issues
- **[FAQ](/troubleshooting/faq)** - Frequently asked questions

---

**Need immediate help?** Check [Troubleshooting](/troubleshooting/common-issues).

