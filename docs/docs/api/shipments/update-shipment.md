# update_shipment

Update an existing shipment record.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the shipment to update |
| `entry_timestamp` | string | No | New entry time (ISO 8601) |
| `exit_timestamp` | string | No | New exit time (ISO 8601) |
| `source` | string | No | New source |
| `facilityId` | string | No | New facility ID |
| `license_plate` | string | No | New license plate |
| `contract_reference_id` | string | No | New contract reference |
| `contractId` | string | No | New contract ID |

At least one update field must be provided.

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "update_shipment",
      "arguments": {
        "id": "67253d4e5g7h8f004gbccd45",
        "exit_timestamp": "2025-11-01T09:00:00.000Z"
      }
    }
  }'
```

## Related Operations

- **[create_shipment](/api/shipments/create-shipment)** - Create new shipment
- **[get_shipment](/api/shipments/get-shipment)** - Get shipment by ID
- **[list_shipments](/api/shipments/list-shipments)** - List all shipments
- **[delete_shipment](/api/shipments/delete-shipment)** - Delete shipment

