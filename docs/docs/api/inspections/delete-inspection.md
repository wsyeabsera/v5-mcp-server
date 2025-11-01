# delete_inspection

Delete an inspection record from the database.

## Description

Permanently removes an inspection record. This operation cannot be undone.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the inspection to delete |

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "delete_inspection",
      "arguments": {
        "id": "67253c3d4f6g7e003fabbc34"
      }
    }
  }'
```

## Returns

Returns the deleted inspection document.

## Related Operations

- **[create_inspection](/api/inspections/create-inspection)** - Create new inspection
- **[get_inspection](/api/inspections/get-inspection)** - Get inspection by ID
- **[list_inspections](/api/inspections/list-inspections)** - List all inspections
- **[update_inspection](/api/inspections/update-inspection)** - Update inspection

