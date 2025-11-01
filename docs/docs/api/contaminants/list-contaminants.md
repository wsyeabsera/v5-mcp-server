# list_contaminants

Retrieve and filter contaminant records.

## Description

Returns an array of contaminant records, optionally filtered by facility ID, shipment ID, or material type.

## Parameters

All parameters are optional. If none are provided, returns all contaminants.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `facilityId` | string | No | Filter by facility ID |
| `shipment_id` | string | No | Filter by shipment ID |
| `material` | string | No | Filter by material (partial match) |

## Example Requests

### List All Contaminants

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contaminants",
      "arguments": {}
    }
  }'
```

### Filter by Facility

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contaminants",
      "arguments": {
        "facilityId": "67253a1b2e4f5c001d8e9a12"
      }
    }
  }'
```

### Filter by Shipment

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contaminants",
      "arguments": {
        "shipment_id": "SHIP-2025-001"
      }
    }
  }'
```

### Filter by Material

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_contaminants",
      "arguments": {
        "material": "battery"
      }
    }
  }'
```

## Use Cases

### Find High-Risk Contaminants at a Facility

```javascript
const contaminants = await listContaminants({ facilityId: 'ABC123' });
const highRisk = contaminants.filter(c => 
  c.explosive_level === 'high' || 
  c.hcl_level === 'high' || 
  c.so2_level === 'high'
);
```

### Track Contaminants in a Shipment

```javascript
const shipmentContaminants = await listContaminants({ 
  shipment_id: 'SHIP-2025-001' 
});
console.log(`Found ${shipmentContaminants.length} contaminants in shipment`);
```

## Related Operations

- **[create_contaminant](/api/contaminants/create-contaminant)** - Create new contaminant
- **[get_contaminant](/api/contaminants/get-contaminant)** - Get specific contaminant
- **[update_contaminant](/api/contaminants/update-contaminant)** - Update contaminant
- **[delete_contaminant](/api/contaminants/delete-contaminant)** - Delete contaminant

