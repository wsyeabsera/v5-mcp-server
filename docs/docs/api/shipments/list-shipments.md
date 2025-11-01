# list_shipments

Retrieve all shipment records.

## Description

Returns an array of all shipment records in the database.

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
      "name": "list_shipments",
      "arguments": {}
    }
  }'
```

## Use Cases

### Find Recent Shipments

```javascript
const shipments = await listShipments();
const today = new Date().toISOString().split('T')[0];
const todayShipments = shipments.filter(s => 
  s.entry_timestamp.startsWith(today)
);
```

### Find Shipments by Facility

```javascript
const shipments = await listShipments();
const facilityShipments = shipments.filter(s => 
  s.facilityId === 'YOUR_FACILITY_ID'
);
```

### Calculate Average Duration

```javascript
const shipments = await listShipments();
const durations = shipments.map(s => {
  const entry = new Date(s.entry_timestamp);
  const exit = new Date(s.exit_timestamp);
  return (exit - entry) / 60000; // minutes
});
const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
```

## Related Operations

- **[create_shipment](/api/shipments/create-shipment)** - Create new shipment
- **[get_shipment](/api/shipments/get-shipment)** - Get specific shipment
- **[update_shipment](/api/shipments/update-shipment)** - Update shipment
- **[delete_shipment](/api/shipments/delete-shipment)** - Delete shipment

