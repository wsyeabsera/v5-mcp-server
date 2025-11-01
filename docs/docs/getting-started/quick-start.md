# Quick Start

Get up and running with the MCP Server in under 5 minutes! This guide assumes you've already [installed the server](/getting-started/installation).

## Step 1: Start the Server

Make sure your server is running:

```bash
npm start
```

You should see:
```
[INFO] MCP Server running on http://localhost:3000
[INFO] Total tools available: 25
```

## Step 2: Test the Connection

Verify the server is responding:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2025-11-01T10:00:00.000Z"
}
```

## Step 3: List Available Tools

See all 25 available MCP tools:

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

This returns all available tools organized by collection:
- **Facilities**: 5 tools (create, get, list, update, delete)
- **Contaminants**: 5 tools
- **Inspections**: 5 tools
- **Shipments**: 5 tools
- **Contracts**: 5 tools

## Step 4: Create Your First Facility

Let's create a waste management facility:

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_facility",
      "arguments": {
        "name": "Central Waste Management",
        "shortCode": "CWM-001",
        "location": "New York, NY"
      }
    }
  }'
```

Success! You'll get a response like:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{
          \"_id\": \"67253a1b2e4f5c001d8e9a12\",
          \"name\": \"Central Waste Management\",
          \"shortCode\": \"CWM-001\",
          \"location\": \"New York, NY\",
          \"__v\": 0
        }"
      }
    ]
  },
  "id": 2
}
```

:::tip
Save the `_id` value - you'll need it to reference this facility in other operations!
:::

## Step 5: List All Facilities

Retrieve all facilities:

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

## Step 6: Create a Related Record

Now let's create a contaminant detection for our facility:

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "create_contaminant",
      "arguments": {
        "wasteItemDetected": "Plastic bottle with hazardous residue",
        "material": "PET plastic",
        "facilityId": "67253a1b2e4f5c001d8e9a12",
        "explosive_level": "low",
        "hcl_level": "medium",
        "so2_level": "low",
        "estimated_size": 0.5,
        "shipment_id": "SHIP-001"
      }
    }
  }'
```

:::info
Replace the `facilityId` with the `_id` from your created facility!
:::

## Common Operations

### Update a Record

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "update_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12",
        "name": "Central Waste Management - Updated",
        "location": "Brooklyn, NY"
      }
    }
  }'
```

### Get a Single Record

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "get_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12"
      }
    }
  }'
```

### Delete a Record

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "tools/call",
    "params": {
      "name": "delete_facility",
      "arguments": {
        "id": "67253a1b2e4f5c001d8e9a12"
      }
    }
  }'
```

## Understanding the Response Format

All responses follow the JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Response data here"
      }
    ],
    "isError": false  // Only present if there's an error
  },
  "id": 1  // Matches your request ID
}
```

## Using with MCP Inspector

For a visual interface, use the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

This opens a web UI where you can:
- Browse all available tools
- Execute tools with a form interface
- See responses in real-time
- Debug connection issues

Learn more in the [MCP Inspector Guide](/guides/mcp-inspector).

## Using with Cursor

To integrate with Cursor AI editor:

1. Open Cursor settings
2. Go to **MCP Servers** section
3. Add configuration:

```json
{
  "mcpServers": {
    "waste-management": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

Learn more in the [Cursor Integration Guide](/guides/cursor-integration).

## Next Steps

Now that you've made your first requests:

1. **[First Steps](/getting-started/first-steps)** - Deeper dive into each collection
2. **[API Reference](/api/overview)** - Explore all 25 tools
3. **[Complete Workflows](/examples/complete-workflows)** - See real-world examples
4. **[Architecture Overview](/architecture/overview)** - Understand how it works

## Quick Reference

### All Collections

| Collection | Create | Get | List | Update | Delete |
|-----------|--------|-----|------|--------|--------|
| Facilities | `create_facility` | `get_facility` | `list_facilities` | `update_facility` | `delete_facility` |
| Contaminants | `create_contaminant` | `get_contaminant` | `list_contaminants` | `update_contaminant` | `delete_contaminant` |
| Inspections | `create_inspection` | `get_inspection` | `list_inspections` | `update_inspection` | `delete_inspection` |
| Shipments | `create_shipment` | `get_shipment` | `list_shipments` | `update_shipment` | `delete_shipment` |
| Contracts | `create_contract` | `get_contract` | `list_contracts` | `update_contract` | `delete_contract` |

### Useful Endpoints

- **MCP Endpoint**: `http://localhost:3000/sse`
- **Health Check**: `http://localhost:3000/health`
- **Server Info**: `http://localhost:3000/`

---

**Ready for more?** Continue to [First Steps](/getting-started/first-steps) for detailed examples with each collection.

