# get_shipment

Retrieve a single shipment record by ID.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the shipment |

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_shipment",
      "arguments": {
        "id": "67253d4e5g7h8f004gbccd45"
      }
    }
  }'
```

## Related Operations

- **[create_shipment](/api/shipments/create-shipment)** - Create new shipment
- **[list_shipments](/api/shipments/list-shipments)** - List all shipments
- **[update_shipment](/api/shipments/update-shipment)** - Update shipment
- **[delete_shipment](/api/shipments/delete-shipment)** - Delete shipment

