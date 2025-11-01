# get_facility

Retrieve a single facility by its MongoDB ObjectId.

## Description

Fetches a specific facility record from the database using its unique `_id`. Returns the complete facility document or an error if not found.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the facility (24-character hex string) |

## Returns

Returns the facility document with all fields.

## Example

### Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12"
      }
    }
  }'
```

### Success Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"_id\":\"67253a1b2e4f5c001d8e9a12\",\"name\":\"Central Waste Management Facility\",\"shortCode\":\"CWM-001\",\"location\":\"New York, NY\",\"__v\":0}"
    }]
  },
  "id": 1
}
```

### Not Found Error

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Facility not found"
    }],
    "isError": true
  },
  "id": 1
}
```

## Common Errors

### Invalid ObjectId Format

```json
{
  "arguments": {
    "id": "invalid-id"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "Error getting facility: Cast to ObjectId failed"
  }],
  "isError": true
}
```

## Best Practices

- Always validate ObjectId format before calling (24 hex characters)
- Handle "not found" errors gracefully
- Cache results if querying frequently

## Related Operations

- **[create_facility](/api/facilities/create-facility)** - Create a new facility
- **[list_facilities](/api/facilities/list-facilities)** - Get all facilities
- **[update_facility](/api/facilities/update-facility)** - Update facility
- **[delete_facility](/api/facilities/delete-facility)** - Delete facility

