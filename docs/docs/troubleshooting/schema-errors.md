# Schema Errors

Understanding and fixing schema validation errors.

## Common Schema Errors

### Type Mismatch

**Error**: `Expected string, received number`

**Cause**: Parameter has wrong type

**Fix**:
```javascript
// Wrong
{ name: 123 }

// Correct
{ name: "Facility Name" }
```

### Missing Required Field

**Error**: `Required`

**Cause**: Required parameter not provided

**Fix**:
```javascript
// Wrong
{ name: "Test" }

// Correct
{ name: "Test", shortCode: "TST-001", location: "City" }
```

### Invalid Enum Value

**Error**: `Invalid enum value`

**Cause**: Value not in allowed list

**Fix**:
```javascript
// Wrong
{ explosive_level: "HIGH" }

// Correct (case-sensitive)
{ explosive_level: "high" }
```

### Invalid Date Format

**Error**: `Invalid date`

**Cause**: Date not in ISO 8601 format

**Fix**:
```javascript
// Wrong
{ detection_time: "11/01/2025" }

// Correct
{ detection_time: "2025-11-01T10:00:00.000Z" }
```

## Schema Reference

See [API Reference](/api/overview) for detailed schemas for each tool.

## Debugging Tips

1. **Check Type**: Strings must be quoted, numbers unquoted
2. **Verify Required Fields**: All required fields must be present
3. **Match Enums Exactly**: Case-sensitive, exact match
4. **Use ISO Dates**: Always use `.toISOString()`

## For More Help

See [Troubleshooting](/troubleshooting/common-issues) and [FAQ](/troubleshooting/faq).

