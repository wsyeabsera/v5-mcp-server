# update_inspection

Update an existing inspection record.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the inspection to update |
| `facilityId` | string | No | New facility ID |
| `Is_delivery_accepted` | boolean | No | New acceptance status |
| `does_delivery_meets_conditions` | boolean | No | New compliance status |
| `selected_wastetypes` | array | No | New waste type breakdown |
| `heating_value_calculation` | number | No | New heating value |
| `waste_producer` | string | No | New producer name |
| `contract_reference_id` | string | No | New contract reference |

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
      "name": "update_inspection",
      "arguments": {
        "id": "67253c3d4f6g7e003fabbc34",
        "Is_delivery_accepted": false,
        "does_delivery_meets_conditions": false
      }
    }
  }'
```

## Related Operations

- **[create_inspection](/api/inspections/create-inspection)** - Create new inspection
- **[get_inspection](/api/inspections/get-inspection)** - Get inspection by ID
- **[list_inspections](/api/inspections/list-inspections)** - List all inspections
- **[delete_inspection](/api/inspections/delete-inspection)** - Delete inspection

