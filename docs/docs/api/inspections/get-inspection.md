# get_inspection

Retrieve a single inspection record by ID.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the inspection |

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_inspection",
      "arguments": {
        "id": "67253c3d4f6g7e003fabbc34"
      }
    }
  }'
```

## Related Operations

- **[create_inspection](/api/inspections/create-inspection)** - Create new inspection
- **[list_inspections](/api/inspections/list-inspections)** - List all inspections
- **[update_inspection](/api/inspections/update-inspection)** - Update inspection
- **[delete_inspection](/api/inspections/delete-inspection)** - Delete inspection

