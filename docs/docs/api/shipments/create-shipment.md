# create_shipment

Create a new shipment tracking record.

## Description

Records a waste shipment delivery to a facility, including entry/exit timestamps, source information, vehicle details, and contract references.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entry_timestamp` | string | Yes | When truck arrived (ISO 8601 format) |
| `exit_timestamp` | string | Yes | When truck left (ISO 8601 format) |
| `source` | string | Yes | Origin/source of the shipment |
| `facilityId` | string | Yes | MongoDB ObjectId of destination facility |
| `license_plate` | string | Yes | Vehicle license plate number |
| `contract_reference_id` | string | Yes | Contract reference code |
| `contractId` | string | Yes | MongoDB ObjectId of the contract |

## Example Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_shipment",
      "arguments": {
        "entry_timestamp": "2025-11-01T08:00:00.000Z",
        "exit_timestamp": "2025-11-01T08:45:00.000Z",
        "source": "Green Manufacturing Co. - Building A",
        "facilityId": "67253a1b2e4f5c001d8e9a12",
        "license_plate": "ABC-1234",
        "contract_reference_id": "WC-2025-001",
        "contractId": "67253e5f6h8i9g005hcdde56"
      }
    }
  }'
```

## Timestamp Format

Both timestamps must be in **ISO 8601** format:
- Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `"2025-11-01T08:00:00.000Z"`
- Timezone: UTC (Z suffix)

```javascript
// Generate current ISO timestamp
const entryTime = new Date().toISOString();

// Calculate exit time (45 minutes later)
const exitTime = new Date(Date.now() + 45 * 60 * 1000).toISOString();
```

## Best Practices

### 1. Validate Timestamp Order

```javascript
const entry = new Date(entryTimestamp);
const exit = new Date(exitTimestamp);

if (exit <= entry) {
  throw new Error('Exit time must be after entry time');
}
```

### 2. Calculate Duration

```javascript
function calculateDuration(entryTimestamp, exitTimestamp) {
  const entry = new Date(entryTimestamp);
  const exit = new Date(exitTimestamp);
  const durationMs = exit - entry;
  const durationMinutes = Math.floor(durationMs / 60000);
  return `${durationMinutes} minutes`;
}
```

### 3. Link to Existing Records

```javascript
// Verify facility and contract exist
const facility = await getFacility(facilityId);
const contract = await getContract(contractId);

// Create shipment
await createShipment({
  facilityId: facility._id,
  contractId: contract._id,
  // ... other fields
});
```

## Related Operations

- **[get_shipment](/api/shipments/get-shipment)** - Get shipment by ID
- **[list_shipments](/api/shipments/list-shipments)** - List all shipments
- **[update_shipment](/api/shipments/update-shipment)** - Update shipment
- **[delete_shipment](/api/shipments/delete-shipment)** - Delete shipment

