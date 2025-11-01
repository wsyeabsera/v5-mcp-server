# list_facilities

Retrieve all facilities from the database.

## Description

Returns an array of all facility records in the database. If no facilities exist, returns an empty array.

## Parameters

No parameters required.

## Returns

Returns an array of facility documents.

## Example

### Request

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_facilities",
      "arguments": {}
    }
  }'
```

### Success Response (Multiple Results)

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "[{\"_id\":\"67253a1b2e4f5c001d8e9a12\",\"name\":\"Central Facility\",\"shortCode\":\"CF-001\",\"location\":\"New York\",\"__v\":0},{\"_id\":\"67253b2c3e5f6d002e9fab23\",\"name\":\"North Regional\",\"shortCode\":\"NR-002\",\"location\":\"Seattle\",\"__v\":0}]"
    }]
  },
  "id": 1
}
```

### Empty Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "[]"
    }]
  },
  "id": 1
}
```

## Usage Examples

### JavaScript - Process Results

```javascript
async function getAllFacilities() {
  const response = await fetch('http://localhost:3000/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'list_facilities',
        arguments: {}
      }
    })
  });
  
  const data = await response.json();
  const facilities = JSON.parse(data.result.content[0].text);
  
  // Process each facility
  facilities.forEach(facility => {
    console.log(`${facility.shortCode}: ${facility.name}`);
  });
  
  return facilities;
}
```

### Python - Filter Results

```python
import requests
import json

def list_facilities_by_location(location_filter):
    response = requests.post(
        'http://localhost:3000/sse',
        json={
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'tools/call',
            'params': {
                'name': 'list_facilities',
                'arguments': {}
            }
        }
    )
    
    data = response.json()
    facilities = json.loads(data['result']['content'][0]['text'])
    
    # Filter client-side
    return [f for f in facilities if location_filter.lower() in f['location'].lower()]
```

## Performance Notes

- Returns all documents (no pagination)
- For large datasets, consider implementing pagination
- Results are not sorted (order is insertion order)

## Best Practices

- Cache results if querying frequently
- Filter on client-side if needed
- Consider pagination for large datasets

## Related Operations

- **[create_facility](/api/facilities/create-facility)** - Create a new facility
- **[get_facility](/api/facilities/get-facility)** - Get specific facility
- **[update_facility](/api/facilities/update-facility)** - Update facility
- **[delete_facility](/api/facilities/delete-facility)** - Delete facility

