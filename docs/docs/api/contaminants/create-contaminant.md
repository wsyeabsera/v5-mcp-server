# create_contaminant

Create a new contaminant detection record.

## Description

Records a detected hazardous material or contaminant found in a waste shipment, including material details, hazard levels, and facility/shipment references.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `wasteItemDetected` | string | Yes | Description of the contaminated item |
| `material` | string | Yes | Material type or composition |
| `facilityId` | string | Yes | MongoDB ObjectId of the facility where detected |
| `detection_time` | string | Yes | ISO 8601 timestamp of detection |
| `explosive_level` | enum | Yes | Explosive hazard level: `"low"`, `"medium"`, or `"high"` |
| `hcl_level` | enum | Yes | Hydrochloric acid level: `"low"`, `"medium"`, or `"high"` |
| `so2_level` | enum | Yes | Sulfur dioxide level: `"low"`, `"medium"`, or `"high"` |
| `estimated_size` | number | Yes | Estimated volume in cubic meters |
| `shipment_id` | string | Yes | Reference to shipment ID |

## Returns

Returns the created contaminant document including auto-generated `_id`.

## Example Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_contaminant",
      "arguments": {
        "wasteItemDetected": "Lithium-ion battery pack",
        "material": "Lithium-ion battery cells with chemical electrolyte",
        "facilityId": "67253a1b2e4f5c001d8e9a12",
        "detection_time": "2025-11-01T08:30:00.000Z",
        "explosive_level": "high",
        "hcl_level": "low",
        "so2_level": "low",
        "estimated_size": 0.3,
        "shipment_id": "SHIP-2025-001"
      }
    }
  }'
```

## Example Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "{\"_id\":\"67253b2c3e5f6d002e9fab23\",\"wasteItemDetected\":\"Lithium-ion battery pack\",\"material\":\"Lithium-ion battery cells with chemical electrolyte\",\"facilityId\":\"67253a1b2e4f5c001d8e9a12\",\"detection_time\":\"2025-11-01T08:30:00.000Z\",\"explosive_level\":\"high\",\"hcl_level\":\"low\",\"so2_level\":\"low\",\"estimated_size\":0.3,\"shipment_id\":\"SHIP-2025-001\",\"__v\":0}"
    }]
  },
  "id": 1
}
```

## Hazard Levels

All three hazard level fields must be one of:
- `"low"` - Minimal hazard
- `"medium"` - Moderate hazard, caution required
- `"high"` - Severe hazard, immediate action required

:::warning
Values are **case-sensitive** and must be exactly as shown. `"Low"` or `"HIGH"` will cause validation errors.
:::

## Date Format

The `detection_time` must be in **ISO 8601** format:
- Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `"2025-11-01T08:30:00.000Z"`
- Timezone: UTC (Z suffix)

```javascript
// Generate ISO 8601 timestamp
const now = new Date().toISOString();
// "2025-11-01T08:30:00.123Z"
```

## Common Errors

### Invalid Enum Value

```json
{
  "arguments": {
    "explosive_level": "VERY HIGH"  // Invalid
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "Error creating contaminant: Invalid enum value"
  }],
  "isError": true
}
```

### Invalid Date Format

```json
{
  "arguments": {
    "detection_time": "11/01/2025"  // Wrong format
  }
}
```

## Best Practices

### 1. Provide Detailed Descriptions

```javascript
// Good
wasteItemDetected: "Industrial chemical container with corrosive residue"
material: "Steel drum with sulfuric acid residue"

// Less useful
wasteItemDetected: "Chemical"
material: "Metal"
```

### 2. Link to Existing Records

```javascript
// Verify facility exists first
const facility = await getFacility(facilityId);

// Then create contaminant
await createContaminant({
  facilityId: facility._id,
  // ... other fields
});
```

### 3. Assess All Hazard Levels

Always provide accurate assessments for all three hazard types:

```javascript
{
  explosive_level: "high",  // Battery can explode
  hcl_level: "low",         // Minimal acid content
  so2_level: "low"          // Minimal sulfur content
}
```

## Related Operations

- **[get_contaminant](/api/contaminants/get-contaminant)** - Get contaminant by ID
- **[list_contaminants](/api/contaminants/list-contaminants)** - Filter and list contaminants
- **[update_contaminant](/api/contaminants/update-contaminant)** - Update contaminant details
- **[delete_contaminant](/api/contaminants/delete-contaminant)** - Remove contaminant record

