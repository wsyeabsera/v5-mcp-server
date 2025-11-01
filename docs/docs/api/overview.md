# API Reference Overview

Welcome to the complete API reference for the MCP Server. This section documents all 25 tools available through the Model Context Protocol.

## Quick Reference

### All Available Tools

| Collection | Create | Get | List | Update | Delete |
|-----------|--------|-----|------|--------|--------|
| **Facilities** | `create_facility` | `get_facility` | `list_facilities` | `update_facility` | `delete_facility` |
| **Contaminants** | `create_contaminant` | `get_contaminant` | `list_contaminants` | `update_contaminant` | `delete_contaminant` |
| **Inspections** | `create_inspection` | `get_inspection` | `list_inspections` | `update_inspection` | `delete_inspection` |
| **Shipments** | `create_shipment` | `get_shipment` | `list_shipments` | `update_shipment` | `delete_shipment` |
| **Contracts** | `create_contract` | `get_contract` | `list_contracts` | `update_contract` | `delete_contract` |

## How to Use This Reference

Each tool is documented with:

- **Description**: What the tool does
- **Parameters**: Input arguments with types and constraints
- **Returns**: Response format and structure
- **Examples**: Real-world usage with curl and JavaScript
- **Common Errors**: Typical issues and solutions

## Request Format

All tools use the JSON-RPC 2.0 protocol:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "TOOL_NAME",
    "arguments": {
      // Tool-specific arguments
    }
  }
}
```

## Response Format

### Success Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ ... result data ... }"
      }
    ]
  },
  "id": 1
}
```

### Error Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error message here"
      }
    ],
    "isError": true
  },
  "id": 1
}
```

## Common Patterns

### Create Operations

All `create_*` tools:
- Accept object with required fields
- Return created document with `_id`
- Validate input with Zod schemas
- Return error if validation fails

**Example**:
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
        "name": "Test Facility",
        "shortCode": "TST-001",
        "location": "Test City"
      }
    }
  }'
```

### Get Operations

All `get_*` tools:
- Accept single `id` parameter
- Return single document or error
- Return 404-style error if not found

**Example**:
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12"
      }
    }
  }'
```

### List Operations

All `list_*` tools:
- Accept no parameters (or optional filters)
- Return array of all documents
- Return empty array if no documents exist

**Example**:
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_facilities",
      "arguments": {}
    }
  }'
```

### Update Operations

All `update_*` tools:
- Accept `id` parameter
- Accept fields to update (partial update)
- Return updated document
- Return error if document not found

**Example**:
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "update_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12",
        "name": "Updated Name"
      }
    }
  }'
```

### Delete Operations

All `delete_*` tools:
- Accept single `id` parameter
- Return deleted document
- Return error if document not found

**Example**:
```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "delete_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12"
      }
    }
  }'
```

## Data Types

### MongoDB ObjectId

**Format**: 24-character hexadecimal string  
**Example**: `"67253a1b2e4f5c001d8e9a12"`

**Usage**:
- All `_id` fields
- All `id` parameters for get/update/delete operations

### Date/Time

**Format**: ISO 8601 string  
**Example**: `"2025-11-01T08:30:00.000Z"`

**Usage**:
- `entry_timestamp`, `exit_timestamp`
- `detection_time`

### Enums

**Format**: Exact string match  
**Example**: `"low"`, `"medium"`, `"high"`

**Usage**:
- `explosive_level`, `hcl_level`, `so2_level`

Must be exactly one of the specified values (case-sensitive).

### Arrays

**Format**: JSON array  
**Example**: `[{"category": "MSW", "percentage": "60"}]`

**Usage**:
- `selected_wastetypes` in inspections

## Authentication

:::warning
**Current Version**: No authentication required

The server currently does not implement authentication. All requests are accepted.

**For Production**: Implement API keys, OAuth, or JWT tokens before deploying to production.
:::

## Rate Limiting

:::warning
**Current Version**: No rate limiting

The server currently does not implement rate limiting.

**For Production**: Implement rate limiting to prevent abuse.
:::

## Error Codes

### Validation Errors

Occur when input doesn't match schema:

```json
{
  "content": [{
    "type": "text",
    "text": "Error creating facility: Expected string, received number"
  }],
  "isError": true
}
```

### Database Errors

Occur when database operation fails:

```json
{
  "content": [{
    "type": "text",
    "text": "Error creating facility: E11000 duplicate key error"
  }],
  "isError": true
}
```

### Not Found Errors

Occur when document doesn't exist:

```json
{
  "content": [{
    "type": "text",
    "text": "Facility not found"
  }],
  "isError": true
}
```

## Best Practices

### 1. Always Check for Errors

```javascript
const response = await fetch('http://localhost:3000/sse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

const data = await response.json();

if (data.result.isError) {
  console.error('Error:', data.result.content[0].text);
  return;
}

const result = JSON.parse(data.result.content[0].text);
```

### 2. Validate ObjectIds

Before calling get/update/delete operations:

```javascript
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

if (!isValidObjectId(facilityId)) {
  throw new Error('Invalid ObjectId format');
}
```

### 3. Handle Async Properly

All database operations are asynchronous:

```javascript
async function createFacility(data) {
  try {
    const response = await callTool('create_facility', data);
    return response;
  } catch (error) {
    console.error('Failed to create facility:', error);
    throw error;
  }
}
```

### 4. Use TypeScript Types

Define types for better DX:

```typescript
interface Facility {
  _id: string;
  name: string;
  shortCode: string;
  location: string;
  __v: number;
}

async function getFacility(id: string): Promise<Facility> {
  const response = await callTool('get_facility', { id });
  return JSON.parse(response.result.content[0].text);
}
```

## Tool Categories

### Core Collections

- **[Facilities](/api/facilities/create-facility)** - Waste management facilities
- **[Contaminants](/api/contaminants/create-contaminant)** - Hazardous material detections
- **Inspections** - Facility inspections and compliance
- **[Shipments](/api/shipments/create-shipment)** - Waste shipment tracking
- **[Contracts](/api/contracts/create-contract)** - Producer-facility agreements

## Next Steps

Start exploring the API:

1. **[Create Facility](/api/facilities/create-facility)** - Create your first facility
2. **[MCP Inspector Guide](/guides/mcp-inspector)** - Use the visual testing tool
3. **[Complete Workflows](/examples/complete-workflows)** - See real-world examples

## Need Help?

- **[Troubleshooting](/troubleshooting/common-issues)** - Common issues and solutions
- **[FAQ](/troubleshooting/faq)** - Frequently asked questions
- **[GitHub Issues](https://github.com/your-org/mcp-server/issues)** - Report bugs or request features

---

**Ready to get started?** Jump to any tool documentation using the sidebar navigation.

