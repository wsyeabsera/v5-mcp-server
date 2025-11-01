# delete_contaminant

Delete a contaminant record from the database.

## Description

Permanently removes a contaminant record. This operation cannot be undone.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the contaminant to delete |

## Example Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "delete_contaminant",
      "arguments": {
        "id": "67253b2c3e5f6d002e9fab23"
      }
    }
  }'
```

## Returns

Returns the deleted contaminant document.

## Related Operations

- **[create_contaminant](/api/contaminants/create-contaminant)** - Create new contaminant
- **[get_contaminant](/api/contaminants/get-contaminant)** - Get contaminant by ID
- **[list_contaminants](/api/contaminants/list-contaminants)** - List contaminants
- **[update_contaminant](/api/contaminants/update-contaminant)** - Update contaminant

