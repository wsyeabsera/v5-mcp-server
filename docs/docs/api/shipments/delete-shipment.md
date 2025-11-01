# delete_shipment

Delete a shipment record from the database.

## Description

Permanently removes a shipment record. This operation cannot be undone.

:::warning
Contaminants that reference this shipment will have invalid `shipment_id` values after deletion.
:::

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the shipment to delete |

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "delete_shipment",
      "arguments": {
        "id": "67253d4e5g7h8f004gbccd45"
      }
    }
  }'
```

## Returns

Returns the deleted shipment document.

## Related Operations

- **[create_shipment](/api/shipments/create-shipment)** - Create new shipment
- **[get_shipment](/api/shipments/get-shipment)** - Get shipment by ID
- **[list_shipments](/api/shipments/list-shipments)** - List all shipments
- **[update_shipment](/api/shipments/update-shipment)** - Update shipment

