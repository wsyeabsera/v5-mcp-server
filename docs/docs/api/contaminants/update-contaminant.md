# update_contaminant

Update an existing contaminant record.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the contaminant to update |
| `wasteItemDetected` | string | No | New description |
| `material` | string | No | New material type |
| `facilityId` | string | No | New facility ID |
| `detection_time` | string | No | New detection time (ISO 8601) |
| `explosive_level` | enum | No | New explosive level (`"low"`, `"medium"`, `"high"`) |
| `hcl_level` | enum | No | New HCl level |
| `so2_level` | enum | No | New SO2 level |
| `estimated_size` | number | No | New size in cubic meters |
| `shipment_id` | string | No | New shipment ID |

At least one update field must be provided.

## Example Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "update_contaminant",
      "arguments": {
        "id": "67253b2c3e5f6d002e9fab23",
        "explosive_level": "medium",
        "estimated_size": 0.5
      }
    }
  }'
```

## Returns

Returns the updated contaminant document with all fields.

## Related Operations

- **[create_contaminant](/api/contaminants/create-contaminant)** - Create new contaminant
- **[get_contaminant](/api/contaminants/get-contaminant)** - Get contaminant by ID
- **[list_contaminants](/api/contaminants/list-contaminants)** - List contaminants
- **[delete_contaminant](/api/contaminants/delete-contaminant)** - Delete contaminant

