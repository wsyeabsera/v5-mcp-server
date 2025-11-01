# list_inspections

Retrieve all inspection records.

## Description

Returns an array of all inspection records in the database.

## Parameters

No parameters required.

## Example

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_inspections",
      "arguments": {}
    }
  }'
```

## Use Cases

### Find Rejected Deliveries

```javascript
const inspections = await listInspections();
const rejected = inspections.filter(i => !i.Is_delivery_accepted);
```

### Find Non-Compliant Deliveries

```javascript
const inspections = await listInspections();
const nonCompliant = inspections.filter(i => !i.does_delivery_meets_conditions);
```

### Get Inspections by Facility

```javascript
const inspections = await listInspections();
const facilityInspections = inspections.filter(i => 
  i.facilityId === 'YOUR_FACILITY_ID'
);
```

## Related Operations

- **[create_inspection](/api/inspections/create-inspection)** - Create new inspection
- **[get_inspection](/api/inspections/get-inspection)** - Get specific inspection
- **[update_inspection](/api/inspections/update-inspection)** - Update inspection
- **[delete_inspection](/api/inspections/delete-inspection)** - Delete inspection

