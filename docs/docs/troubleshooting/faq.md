# Frequently Asked Questions

Common questions and answers about the MCP Server.

## General

### What is this MCP Server?

The MCP Server is a TypeScript-based HTTP server that provides waste management data access through the Model Context Protocol (MCP). It allows AI clients like Cursor and custom applications to interact with facility, inspection, contaminant, shipment, and contract data.

### What is MCP?

MCP (Model Context Protocol) is a standard protocol for AI assistants to interact with tools and data sources. It's developed by Anthropic and supported by various AI clients.

### Do I need to know MCP to use this?

No! You can use the server through:
- **MCP Inspector** - Visual web interface
- **Cursor** - AI editor integration
- **Direct HTTP** - Standard REST-like calls

## Setup

### What do I need to run this?

- Node.js 18+
- MongoDB 6.0+
- npm or yarn
- That's it!

### Can I use a cloud MongoDB?

Yes! MongoDB Atlas works great. Just set your `MONGODB_URI` in `.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### What port does it run on?

Default is 3000, configurable via `PORT` in `.env`.

## Usage

### How do I create a facility?

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
        "name": "My Facility",
        "shortCode": "MF-001",
        "location": "City, State"
      }
    }
  }'
```

Or use MCP Inspector or Cursor with natural language!

### How do I list all facilities?

Use the `list_facilities` tool with empty arguments.

### Can I filter list results?

Some tools support filters (e.g., `list_contaminants` can filter by `facilityId`). Otherwise, filter client-side after fetching.

### How do I update a record?

Use the corresponding `update_*` tool with the record's `_id` and fields to update. Only include fields you want to change.

### How do I delete a record?

Use the corresponding `delete_*` tool with the record's `_id`. **Warning**: This is permanent!

## Data

### What's an ObjectId?

MongoDB's unique identifier format - a 24-character hexadecimal string like `67253a1b2e4f5c001d8e9a12`.

### How do I get an ObjectId?

ObjectIds are automatically generated when you create records. Save the `_id` from the response.

### What's the `__v` field?

Mongoose's version key for optimistic concurrency control. You can ignore it.

### Are there foreign key constraints?

No. References are stored as strings and not enforced. Always validate that referenced records exist before creating related data.

### Can I delete a facility that has inspections?

Yes, but the inspections will have invalid `facilityId` references. Consider implementing safe delete or cascade delete patterns.

## Technical

### What's the difference between SSE and StreamableHTTP?

StreamableHTTP is the newer, preferred transport for MCP. SSE (Server-Sent Events) is deprecated. This server uses a custom HTTP endpoint that works with both.

### Does it support authentication?

Not currently. Add authentication middleware for production use.

### Is there rate limiting?

No. Implement rate limiting for production deployments.

### Can I use this in production?

The server is production-ready but consider adding:
- Authentication
- Rate limiting
- HTTPS/TLS
- Monitoring
- Backups

### What's the performance like?

- Local: ~10-50ms per operation
- Remote DB: ~50-200ms
- Supports ~1000 req/s (single server)

For higher loads, implement caching and horizontal scaling.

## Errors

### "Expected string, received number"

Type mismatch. Ensure all parameters match the expected types (string, number, boolean, array).

### "Cast to ObjectId failed"

Invalid ObjectId format. Use 24-character hex strings.

### "Facility not found"

The facility with that `_id` doesn't exist. Verify the ID is correct.

### "Invalid enum value"

For hazard levels, use exactly: `"low"`, `"medium"`, or `"high"` (case-sensitive).

### "Invalid date"

Use ISO 8601 format: `"2025-11-01T10:00:00.000Z"`

## Integration

### How do I use with Cursor?

1. Add to Cursor settings:
   ```json
   {
     "mcpServers": {
       "waste-management": {
         "url": "http://localhost:3000/sse"
       }
     }
   }
   ```
2. Restart Cursor
3. Ask AI to use the tools!

### How do I test without Cursor?

Use **MCP Inspector**:

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

### Can I use this from Python?

Yes! Use `requests`:

```python
import requests

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
```

### Can I use this from JavaScript/Node.js?

Yes! Use `fetch` or `axios`:

```javascript
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
```

## Development

### How do I add a new tool?

1. Define Zod schema in corresponding tool file
2. Create tool object with `description`, `inputSchema`, and `handler`
3. Export tool in `src/tools/index.ts`
4. Tool automatically available via MCP!

### How do I add a new collection?

1. Create Mongoose model in `src/models/`
2. Create tools file in `src/tools/`
3. Export tools in `src/tools/index.ts`
4. Done!

### How do I run in development mode?

```bash
npm run dev
```

This watches for changes and auto-reloads.

### How do I run tests?

Currently no test suite included. Consider adding:
- Jest for unit tests
- Supertest for API tests
- MongoDB Memory Server for test database

## Deployment

### How do I deploy to production?

1. Set environment variables
2. Build: `npm run build`
3. Start: `npm start`
4. Use process manager (PM2, systemd)
5. Set up reverse proxy (nginx)
6. Enable HTTPS

### Can I deploy to Heroku/AWS/Azure?

Yes! Works on any platform that supports Node.js and can connect to MongoDB.

### Do I need to expose port 3000?

For production, use a reverse proxy (nginx) on port 80/443 and proxy to port 3000.

## Support

### Where can I get help?

- **Documentation**: You're reading it!
- **Troubleshooting**: [Common Issues](/troubleshooting/common-issues)
- **GitHub**: File an issue
- **Community**: Join discussions

### Can I contribute?

Yes! Pull requests welcome:
- Bug fixes
- New features
- Documentation improvements
- Examples

### How do I report a bug?

File an issue on GitHub with:
- Description
- Steps to reproduce
- Expected vs actual behavior
- Server logs
- Environment details

### Is there a roadmap?

Potential future features:
- Pagination for list operations
- Advanced filtering and search
- Bulk operations
- Data export/import
- Analytics dashboard
- Real-time notifications

---

**Still have questions?** Check [Troubleshooting](/troubleshooting/common-issues) or file an issue on GitHub!

