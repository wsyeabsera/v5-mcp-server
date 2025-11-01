# Using MCP Inspector

The **MCP Inspector** is a visual web interface for testing and debugging MCP servers. It's the fastest way to verify your server is working correctly.

## What is MCP Inspector?

MCP Inspector is an official tool from Anthropic that provides:
- Visual interface for testing MCP servers
- Tool discovery and browsing
- Interactive form-based tool execution
- Real-time request/response inspection
- Connection debugging

## Installation

No installation required! MCP Inspector runs with `npx`:

```bash
npx @modelcontextprotocol/inspector
```

## Quick Start

### 1. Start Your MCP Server

First, make sure your MCP server is running:

```bash
cd /path/to/mcp-server
npm start
```

You should see:
```
[INFO] MCP Server running on http://localhost:3000
[INFO] Total tools available: 25
```

### 2. Launch MCP Inspector

In a new terminal:

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

This will:
1. Download MCP Inspector (if needed)
2. Start a local web server
3. Open your browser automatically
4. Connect to your MCP server

### 3. Verify Connection

You should see:
- **Status**: Connected ✓
- **Server Info**: waste-management-mcp-server v1.0.0
- **Tools**: 25 available tools

## Using the Interface

### Overview Tab

Shows server information:
- Protocol version
- Server name and version
- Capabilities
- Connection status

### Tools Tab

Lists all available tools organized by collection:
- create_facility, get_facility, list_facilities, update_facility, delete_facility
- create_contaminant, get_contaminant, list_contaminants, update_contaminant, delete_contaminant
- create_inspection, get_inspection, list_inspections, update_inspection, delete_inspection
- create_shipment, get_shipment, list_shipments, update_shipment, delete_shipment
- create_contract, get_contract, list_contracts, update_contract, delete_contract

## Testing Tools

### Example: Create a Facility

1. **Select Tool**
   - Click on `create_facility` in the tools list

2. **Fill Form**
   ```
   name: Test Facility
   shortCode: TST-001
   location: Test City
   ```

3. **Execute**
   - Click "Execute Tool" button

4. **View Response**
   ```json
   {
     "_id": "67253a1b2e4f5c001d8e9a12",
     "name": "Test Facility",
     "shortCode": "TST-001",
     "location": "Test City",
     "__v": 0
   }
   ```

5. **Save the ID**
   - Copy the `_id` value for use in other operations

### Example: List All Facilities

1. **Select Tool**
   - Click on `list_facilities`

2. **Execute**
   - No parameters needed
   - Click "Execute Tool"

3. **View Results**
   - See array of all facilities
   - Should include the facility you just created

### Example: Get a Specific Facility

1. **Select Tool**
   - Click on `get_facility`

2. **Fill Form**
   ```
   id: 67253a1b2e4f5c001d8e9a12
   ```
   (Use the ID from create step)

3. **Execute**
   - Click "Execute Tool"

4. **View Response**
   - Should return the exact facility document

## Complete Test Workflow

### Step 1: Create Facility

```
Tool: create_facility
Arguments:
  name: "North Processing Center"
  shortCode: "NPC-001"
  location: "Seattle, WA"
  
Result: Save _id → FACILITY_ID
```

### Step 2: Create Contract

```
Tool: create_contract
Arguments:
  producerName: "Green Manufacturing Co."
  debitorName: "North Processing Center"
  wasteCode: "WC-2025-TEST"
  
Result: Save _id → CONTRACT_ID
```

### Step 3: Create Shipment

```
Tool: create_shipment
Arguments:
  entry_timestamp: "2025-11-01T08:00:00.000Z"
  exit_timestamp: "2025-11-01T08:45:00.000Z"
  source: "Green Manufacturing - Building A"
  facilityId: FACILITY_ID
  license_plate: "TEST-123"
  contract_reference_id: "WC-2025-TEST"
  contractId: CONTRACT_ID
  
Result: Save _id → SHIPMENT_ID
```

### Step 4: Create Contaminant

```
Tool: create_contaminant
Arguments:
  wasteItemDetected: "Test battery"
  material: "Lithium-ion"
  facilityId: FACILITY_ID
  detection_time: "2025-11-01T08:30:00.000Z"
  explosive_level: "high"
  hcl_level: "low"
  so2_level: "low"
  estimated_size: 0.5
  shipment_id: SHIPMENT_ID
```

### Step 5: Create Inspection

```
Tool: create_inspection
Arguments:
  facilityId: FACILITY_ID
  Is_delivery_accepted: true
  does_delivery_meets_conditions: true
  selected_wastetypes: [
    {"category": "MSW", "percentage": "100"}
  ]
  heating_value_calculation: 12000
  waste_producer: "Green Manufacturing Co."
  contract_reference_id: "WC-2025-TEST"
```

## Debugging Connection Issues

### Server Not Found

**Error**: `Failed to connect to http://localhost:3000/sse`

**Solutions**:
1. Verify server is running: `curl http://localhost:3000/health`
2. Check port is correct (default: 3000)
3. Ensure no firewall blocking

### Invalid Schema Errors

**Error**: `invalid literal` or schema validation errors

**Solutions**:
1. Update to latest server code
2. Verify schemas use `$refStrategy: 'none'`
3. Check server logs for details

### Tool Execution Fails

**Error**: Tool returns error response

**Debug Steps**:
1. Check server logs for detailed error
2. Verify all required parameters provided
3. Check parameter types (string vs number)
4. Verify IDs are valid MongoDB ObjectIds

## Advanced Features

### Request/Response Inspection

Click on any executed tool to see:
- Raw JSON-RPC request
- Raw JSON-RPC response
- Timestamps
- Execution time

### Schema Inspection

For each tool, view:
- Input schema (JSON Schema format)
- Required vs optional parameters
- Parameter types
- Descriptions

### Connection Management

- **Reconnect**: If connection drops
- **Change URL**: Connect to different server
- **Clear History**: Reset executed tools list

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Quick tool search
- `Ctrl/Cmd + Enter`: Execute selected tool
- `Esc`: Close dialogs
- `Tab`: Navigate form fields

## Tips & Tricks

### 1. Generate Timestamps

For `detection_time`, `entry_timestamp`, etc.:

```javascript
// In browser console
new Date().toISOString()
// "2025-11-01T10:30:00.123Z"

// 45 minutes from now
new Date(Date.now() + 45 * 60 * 1000).toISOString()
```

### 2. Copy ObjectIds

After creating a record:
- Click on the result
- Copy the `_id` field
- Paste into subsequent operations

### 3. Test Error Handling

Intentionally provide invalid data:
- Wrong type: `name: 123` instead of `name: "test"`
- Missing required field
- Invalid ObjectId format
- Invalid enum value

### 4. Bulk Testing

Execute multiple operations:
1. Create 5 facilities
2. List them all
3. Update one
4. Delete one
5. List again to verify

## Troubleshooting

### Cannot Start Inspector

```bash
# Clear npm cache
npm cache clean --force

# Try again
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

### Port Already in Use

```bash
# Inspector runs on port 5173 by default
# If blocked, kill the process:
lsof -ti:5173 | xargs kill
```

### Browser Doesn't Open

Manually open: `http://localhost:5173`

## Next Steps

- **[Cursor Integration](/guides/cursor-integration)** - Connect to Cursor AI editor
- **[Workflows Guide](/guides/workflows)** - Common usage patterns
- **[API Reference](/api/overview)** - Detailed tool documentation

---

**Having issues?** Check the [Troubleshooting Guide](/troubleshooting/common-issues).

