# update_facility

Update an existing facility's information.

## Description

Modifies one or more fields of an existing facility. Only provided fields will be updated - omitted fields remain unchanged (partial update).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the facility to update |
| `name` | string | No | New facility name |
| `shortCode` | string | No | New short code |
| `location` | string | No | New location |

At least one of `name`, `shortCode`, or `location` must be provided.

## Returns

Returns the updated facility document with all fields.

## Example

### Update Single Field

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "update_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12",
        "location": "Brooklyn, NY"
      }
    }
  }'
```

### Update Multiple Fields

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "update_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12",
        "name": "Central Waste Management - Updated",
        "location": "Brooklyn, NY"
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
      "text": "{\"_id\":\"67253a1b2e4f5c001d8e9a12\",\"name\":\"Central Waste Management - Updated\",\"shortCode\":\"CWM-001\",\"location\":\"Brooklyn, NY\",\"__v\":0}"
    }]
  },
  "id": 1
}
```

## Common Errors

### Facility Not Found

```json
{
  "content": [{
    "type": "text",
    "text": "Facility not found"
  }],
  "isError": true
}
```

### No Update Fields Provided

```json
{
  "arguments": {
    "id": "67253a1b2e4f5c001d8e9a12"
    // No fields to update
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "Error updating facility: At least one field must be provided"
  }],
  "isError": true
}
```

## JavaScript Example

```javascript
async function updateFacility(id, updates) {
  const response = await fetch('http://localhost:3000/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'update_facility',
        arguments: {
          id,
          ...updates
        }
      }
    })
  });
  
  const data = await response.json();
  
  if (data.result.isError) {
    throw new Error(data.result.content[0].text);
  }
  
  return JSON.parse(data.result.content[0].text);
}

// Usage
const updated = await updateFacility('67253a1b2e4f5c001d8e9a12', {
  name: 'New Name',
  location: 'New Location'
});
```

## Best Practices

- Only include fields you want to change
- Verify facility exists before updating
- Handle "not found" errors gracefully
- Save the returned document (contains updated data)

## Related Operations

- **[create_facility](/api/facilities/create-facility)** - Create a new facility
- **[get_facility](/api/facilities/get-facility)** - Get facility details
- **[list_facilities](/api/facilities/list-facilities)** - List all facilities
- **[delete_facility](/api/facilities/delete-facility)** - Delete facility

