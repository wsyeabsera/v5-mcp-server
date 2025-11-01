# create_inspection

Create a new facility inspection record.

## Description

Records an inspection of a waste delivery at a facility, including acceptance decision, compliance checks, waste type analysis, and heating value calculations.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `facilityId` | string | Yes | MongoDB ObjectId of the facility |
| `Is_delivery_accepted` | boolean | Yes | Was the delivery accepted? |
| `does_delivery_meets_conditions` | boolean | Yes | Does delivery meet contract conditions? |
| `selected_wastetypes` | array | Yes | Array of waste type breakdown objects |
| `selected_wastetypes[].category` | string | Yes | Waste category name |
| `selected_wastetypes[].percentage` | string | Yes | Percentage of this waste type (as string, e.g., "60") |
| `heating_value_calculation` | number | Yes | Heating value in BTU or similar units |
| `waste_producer` | string | Yes | Name of the waste producer company |
| `contract_reference_id` | string | Yes | Contract reference code |

## Example Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_inspection",
      "arguments": {
        "facilityId": "67253a1b2e4f5c001d8e9a12",
        "Is_delivery_accepted": true,
        "does_delivery_meets_conditions": true,
        "selected_wastetypes": [
          {
            "category": "Municipal Solid Waste",
            "percentage": "60"
          },
          {
            "category": "Commercial Waste",
            "percentage": "40"
          }
        ],
        "heating_value_calculation": 12500,
        "waste_producer": "Green Manufacturing Co.",
        "contract_reference_id": "WC-2025-001"
      }
    }
  }'
```

## Waste Types Format

The `selected_wastetypes` field is an array of objects:

```json
[
  { "category": "Municipal Solid Waste", "percentage": "60" },
  { "category": "Commercial Waste", "percentage": "30" },
  { "category": "Industrial Waste", "percentage": "10" }
]
```

:::info
Percentages are strings (e.g., `"60"`, not `60`). They should ideally sum to 100, but this is not enforced.
:::

## Common Waste Categories

- Municipal Solid Waste (MSW)
- Commercial Waste
- Industrial Waste
- Hazardous Waste
- Construction & Demolition (C&D)
- Electronic Waste (E-Waste)
- Medical Waste
- Agricultural Waste

## Best Practices

### 1. Validate Percentages Sum to 100

```javascript
function validateWasteTypes(wasteTypes) {
  const total = wasteTypes.reduce((sum, wt) => 
    sum + parseFloat(wt.percentage), 0
  );
  
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Percentages sum to ${total}, expected 100`);
  }
}
```

### 2. Link to Existing Facility

```javascript
// Verify facility exists
const facility = await getFacility(facilityId);

// Create inspection
await createInspection({
  facilityId: facility._id,
  // ... other fields
});
```

## Related Operations

- **[get_inspection](/api/inspections/get-inspection)** - Get inspection by ID
- **[list_inspections](/api/inspections/list-inspections)** - List all inspections
- **[update_inspection](/api/inspections/update-inspection)** - Update inspection
- **[delete_inspection](/api/inspections/delete-inspection)** - Delete inspection

