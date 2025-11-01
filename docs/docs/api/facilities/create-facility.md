# create_facility

Create a new waste management facility in the database.

## Description

Creates a new facility record with a name, short code, and location. Facilities are the core entity in the waste management system - they receive shipments, perform inspections, and detect contaminants.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Full name of the facility |
| `shortCode` | string | Yes | Short alphanumeric identifier (e.g., "CWM-001") |
| `location` | string | Yes | Physical address or location description |

## Returns

Returns the created facility document including:
- `_id`: MongoDB ObjectId (auto-generated)
- `name`: Facility name
- `shortCode`: Short code
- `location`: Location
- `__v`: Mongoose version key

## Example Request

### curl

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_facility",
      "arguments": {
        "name": "Central Waste Management Facility",
        "shortCode": "CWM-001",
        "location": "123 Industrial Blvd, New York, NY 10001"
      }
    }
  }'
```

### JavaScript

```javascript
async function createFacility() {
  const response = await fetch('http://localhost:3000/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'create_facility',
        arguments: {
          name: 'Central Waste Management Facility',
          shortCode: 'CWM-001',
          location: '123 Industrial Blvd, New York, NY 10001'
        }
      }
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.result.content[0].text);
}
```

### Python

```python
import requests
import json

def create_facility():
    response = requests.post(
        'http://localhost:3000/sse',
        headers={'Content-Type': 'application/json'},
        json={
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'tools/call',
            'params': {
                'name': 'create_facility',
                'arguments': {
                    'name': 'Central Waste Management Facility',
                    'shortCode': 'CWM-001',
                    'location': '123 Industrial Blvd, New York, NY 10001'
                }
            }
        }
    )
    
    data = response.json()
    return json.loads(data['result']['content'][0]['text'])
```

## Example Response

### Success

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"_id\":\"67253a1b2e4f5c001d8e9a12\",\"name\":\"Central Waste Management Facility\",\"shortCode\":\"CWM-001\",\"location\":\"123 Industrial Blvd, New York, NY 10001\",\"__v\":0}"
      }
    ]
  },
  "id": 1
}
```

**Parsed Result**:
```json
{
  "_id": "67253a1b2e4f5c001d8e9a12",
  "name": "Central Waste Management Facility",
  "shortCode": "CWM-001",
  "location": "123 Industrial Blvd, New York, NY 10001",
  "__v": 0
}
```

## Common Errors

### Missing Required Field

**Request**:
```json
{
  "arguments": {
    "name": "Test Facility"
    // Missing shortCode and location
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Error creating facility: Required"
    }],
    "isError": true
  },
  "id": 1
}
```

### Wrong Type

**Request**:
```json
{
  "arguments": {
    "name": 123,  // Should be string
    "shortCode": "TST-001",
    "location": "Test"
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Error creating facility: Expected string, received number"
    }],
    "isError": true
  },
  "id": 1
}
```

### Database Error

**Example**: MongoDB connection failure

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Error creating facility: MongoNetworkError: connection refused"
    }],
    "isError": true
  },
  "id": 1
}
```

## Validation Rules

- **name**: 
  - Must be a string
  - Cannot be empty
  - No maximum length enforced

- **shortCode**: 
  - Must be a string
  - Cannot be empty
  - Should be unique (not enforced by database)
  - Recommended format: `XXX-NNN` (e.g., "CWM-001")

- **location**: 
  - Must be a string
  - Cannot be empty
  - Can be full address or general location

## Best Practices

### 1. Use Consistent Short Codes

```javascript
// Good
shortCode: "CWM-001"
shortCode: "NRPC-042"
shortCode: "SF-MAIN"

// Avoid
shortCode: "facility1"
shortCode: "abc"
```

### 2. Provide Full Location Details

```javascript
// Good
location: "123 Industrial Blvd, New York, NY 10001"
location: "Seattle Processing Center, 4500 4th Ave S, Seattle, WA 98134"

// Less useful
location: "New York"
location: "Building A"
```

### 3. Check for Duplicates Before Creating

```javascript
async function createFacilityIfNotExists(data) {
  // List all facilities
  const facilities = await listFacilities();
  
  // Check if shortCode exists
  const exists = facilities.some(f => f.shortCode === data.shortCode);
  
  if (exists) {
    throw new Error(`Facility with shortCode ${data.shortCode} already exists`);
  }
  
  return await createFacility(data);
}
```

### 4. Save the Returned ID

```javascript
const facility = await createFacility({
  name: "Test Facility",
  shortCode: "TST-001",
  location: "Test City"
});

// Save this ID for future operations
const facilityId = facility._id;

// Use it to create related records
await createContaminant({
  facilityId: facilityId,
  // ... other fields
});
```

## Related Operations

- **[get_facility](/api/facilities/get-facility)** - Retrieve a facility by ID
- **[list_facilities](/api/facilities/list-facilities)** - Get all facilities
- **[update_facility](/api/facilities/update-facility)** - Modify facility details
- **[delete_facility](/api/facilities/delete-facility)** - Remove a facility

## Related Collections

Once you've created a facility, you can:

- Create **inspections** referencing this facility
- Create **contaminants** detected at this facility
- Create **shipments** delivered to this facility

## Notes

- The `_id` field is automatically generated by MongoDB
- The `__v` field is Mongoose's version key for optimistic concurrency
- There are no uniqueness constraints - you can create multiple facilities with the same name or shortCode
- Facilities are independent and don't require any other records to exist first

## Next Steps

- **[List Facilities](/api/facilities/list-facilities)** - See all created facilities
- **[Create Inspection](/api/inspections/create-inspection)** - Link an inspection to this facility
- **[Complete Workflow](/examples/complete-workflows)** - See facility in a full workflow

---

**Need help?** Check the [Troubleshooting Guide](/troubleshooting/common-issues) or [FAQ](/troubleshooting/faq).

