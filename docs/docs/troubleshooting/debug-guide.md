# Debug Guide

Step-by-step debugging guide for the MCP Server.

## Enable Debug Logging

Add to `.env`:
```
LOG_LEVEL=debug
```

This provides detailed logs for all operations.

## Common Debug Steps

### 1. Verify Server is Running

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

### 2. Test JSON-RPC Endpoint

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }'
```

### 3. List All Tools

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

Should return 25 tools.

### 4. Test a Simple Operation

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

## Check Logs

Server logs show:
- Incoming requests
- Tool executions
- Errors with stack traces
- Database operations

## Use MCP Inspector

Best visual debugging tool:

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

## MongoDB Debugging

Connect directly to inspect data:

```bash
mongosh mongodb://localhost:27017/waste-management
```

```javascript
// List collections
show collections

// Count documents
db.facilities.countDocuments()

// Find all facilities
db.facilities.find().pretty()

// Find specific facility
db.facilities.findOne({ shortCode: "CPC-001" })
```

## Network Debugging

Check if port is accessible:

```bash
nc -zv localhost 3000
```

Check what's using the port:

```bash
lsof -i :3000
```

## For More Help

See [Common Issues](/troubleshooting/common-issues) and [FAQ](/troubleshooting/faq).

