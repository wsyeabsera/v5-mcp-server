# get_contaminant

Retrieve a single contaminant record by ID.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the contaminant |

## Example Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_contaminant",
      "arguments": {
        "id": "67253b2c3e5f6d002e9fab23"
      }
    }
  }'
```

## Returns

Returns the complete contaminant document with all fields.

## Related Operations

- **[create_contaminant](/api/contaminants/create-contaminant)** - Create new contaminant
- **[list_contaminants](/api/contaminants/list-contaminants)** - List all contaminants
- **[update_contaminant](/api/contaminants/update-contaminant)** - Update contaminant
- **[delete_contaminant](/api/contaminants/delete-contaminant)** - Delete contaminant

