# Cursor Integration

Integrate the MCP Server with Cursor AI editor for powerful AI-assisted waste management data operations.

## What is Cursor?

**Cursor** is an AI-first code editor built on VSCode that supports the Model Context Protocol (MCP), allowing AI assistants to interact with your MCP server directly.

## Prerequisites

- **Cursor** installed ([download here](https://cursor.sh/))
- **MCP Server** running on `http://localhost:3000`
- Basic understanding of Cursor's AI features

## Setup Instructions

### Step 1: Open Cursor Settings

1. Open Cursor
2. Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
3. Search for "MCP" in settings
4. Click on "MCP Servers" section

### Step 2: Add Server Configuration

Add the MCP server configuration:

```json
{
  "mcpServers": {
    "waste-management": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

**Configuration Details**:
- `waste-management`: Custom name for your server
- `url`: Full URL to your MCP endpoint

### Step 3: Restart Cursor

1. Save settings
2. Restart Cursor completely
3. Reopen your project

### Step 4: Verify Connection

1. Open Cursor's AI chat (Cmd/Ctrl + L)
2. Type: `Can you list all facilities?`
3. AI should use the `list_facilities` tool

If successful, you'll see the AI query your server and return results!

## Using MCP Tools in Cursor

### Natural Language Queries

You can ask Cursor to use your MCP tools naturally:

**Examples**:

```
"Create a new facility called Central Processing in New York"
→ AI calls create_facility

"Show me all contaminants with high explosive levels"
→ AI calls list_contaminants and filters results

"What shipments arrived today at facility ID ABC123?"
→ AI calls list_shipments and filters by date

"Update facility ABC123 to change location to Brooklyn"
→ AI calls update_facility
```

### Direct Tool Invocation

Ask Cursor to use specific tools:

```
"Use the create_inspection tool to record an inspection for facility ABC123"

"Call list_contracts and show me all contracts for Green Manufacturing"

"Use get_facility to retrieve details for ID ABC123"
```

## Common Use Cases

### 1. Data Entry

**Prompt**:
```
Create a new facility with these details:
- Name: South Regional Processing Center
- Short Code: SRPC-001
- Location: Miami, FL
```

**What Happens**:
1. Cursor calls `create_facility`
2. Returns the created facility with ID
3. AI shows you the result

### 2. Data Analysis

**Prompt**:
```
Show me statistics on all contaminants:
- How many high-risk items?
- What are the most common materials?
- Which facility has the most detections?
```

**What Happens**:
1. Cursor calls `list_contaminants`
2. AI processes the data
3. Provides analysis and statistics

### 3. Workflow Automation

**Prompt**:
```
Complete shipment workflow:
1. Create a facility "Test Facility"
2. Create a contract for "Test Producer" with code "TEST-001"
3. Create a shipment linking them
4. Record an inspection
```

**What Happens**:
1. Cursor executes multiple tool calls in sequence
2. Passes IDs between operations
3. Shows complete workflow result

### 4. Data Validation

**Prompt**:
```
Check if facility ID ABC123 exists, and if so, list all its inspections
```

**What Happens**:
1. Cursor calls `get_facility`
2. If found, calls `list_inspections`
3. Filters for that facility
4. Shows results

## Advanced Techniques

### Multi-Step Operations

**Prompt**:
```
I need to:
1. Find all facilities in New York
2. For each one, list contaminants detected in the last month
3. Create a summary report
```

Cursor will:
- Call `list_facilities`
- Filter by location
- Call `list_contaminants` for each
- Generate formatted report

### Data Transformation

**Prompt**:
```
Get all inspections and create a CSV export with:
- Facility name
- Date
- Was accepted (yes/no)
- Waste types (comma-separated)
```

Cursor will:
- Call `list_inspections`
- Call `get_facility` for each
- Format data as CSV
- Provide downloadable result

### Error Handling

**Prompt**:
```
Try to get facility with ID "invalid", and if it fails, list all facilities instead
```

Cursor intelligently handles errors and fallback logic.

## Configuration Options

### Advanced Configuration

```json
{
  "mcpServers": {
    "waste-management": {
      "url": "http://localhost:3000/sse",
      "timeout": 30000,
      "retries": 3,
      "headers": {
        "X-Custom-Header": "value"
      }
    }
  }
}
```

**Options**:
- `timeout`: Request timeout in milliseconds (default: 30000)
- `retries`: Number of retry attempts (default: 3)
- `headers`: Custom HTTP headers

### Multiple Environments

```json
{
  "mcpServers": {
    "waste-management-dev": {
      "url": "http://localhost:3000/sse"
    },
    "waste-management-staging": {
      "url": "https://staging.example.com/sse"
    },
    "waste-management-prod": {
      "url": "https://api.example.com/sse"
    }
  }
}
```

Switch environments by specifying server name in prompts:
```
"Use waste-management-prod to list facilities"
```

## Troubleshooting

### Server Not Found

**Error**: `Cannot connect to MCP server`

**Solutions**:
1. Verify server is running: `curl http://localhost:3000/health`
2. Check URL in configuration is correct
3. Restart Cursor after config changes
4. Check firewall settings

### Tools Not Available

**Error**: `No MCP tools found`

**Solutions**:
1. Restart Cursor completely
2. Verify configuration JSON is valid
3. Check server logs for connection attempts
4. Ensure server exposes `tools/list` endpoint

### Authentication Issues

If your server requires authentication:

```json
{
  "mcpServers": {
    "waste-management": {
      "url": "http://localhost:3000/sse",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

### Slow Responses

If AI takes too long:
1. Increase timeout in configuration
2. Check server performance
3. Optimize database queries
4. Add indexes to MongoDB

## Best Practices

### 1. Be Specific in Prompts

```
✅ Good: "Create a facility named 'Central Processing' with short code 'CP-001' in New York"
❌ Bad: "Make a facility"
```

### 2. Reference IDs Explicitly

```
✅ Good: "Update facility 67253a1b2e4f5c001d8e9a12 to change its location"
❌ Bad: "Update that facility we just created"
```

### 3. Use Natural Language

Don't worry about exact parameter names:
```
✅ "Create a high-risk contaminant for shipment ABC"
✅ "Add a battery detection with explosive level high"
```

Both work! Cursor understands intent.

### 4. Chain Operations Logically

```
✅ "Create a facility, save its ID, then create an inspection for that facility"
❌ "Create a facility and an inspection" (might use wrong ID)
```

## Productivity Tips

### Use Cursor Composer

Open Composer (Cmd/Ctrl + I) for multi-step operations:

```
@waste-management create a complete waste tracking workflow:
1. New facility in Seattle
2. Contract with Acme Corp
3. Shipment today
4. Inspection with 60% MSW, 40% commercial
5. Battery contaminant detection
```

Cursor executes all steps automatically!

### Save Common Queries

Create a notes file with common prompts:

```markdown
# Common MCP Queries

## Daily Operations
- "List all shipments from today"
- "Show high-risk contaminants from this week"
- "Count rejected inspections"

## Reporting
- "Export all facilities as CSV"
- "Summary of contaminants by facility"
- "Monthly shipment statistics"
```

## Example Session

Here's a complete Cursor session example:

```
You: Create a test facility called "Demo Facility" with code "DEMO-001" in Test City

Cursor: ✓ Created facility with ID 67253a1b2e4f5c001d8e9a12

You: Now create a contract for "Test Producer" and "Demo Facility" with code "TEST-2025"

Cursor: ✓ Created contract with ID 67253b2c3e5f6d002e9fab23

You: Create a shipment that arrived at 8am today and left at 9am, from "Test Source", for that facility and contract, license plate "TEST-123"

Cursor: ✓ Created shipment with ID 67253c3d4f6g7e003fabbc34

You: Record an inspection for this shipment showing 100% MSW, heating value 12000, accepted

Cursor: ✓ Created inspection with ID 67253d4e5g7h8f004gbccd45

You: Show me all records we just created

Cursor: [Lists all 4 records with details]
```

## Next Steps

- **[Workflows Guide](/guides/workflows)** - Common patterns and workflows
- **[Best Practices](/guides/best-practices)** - Tips for production use
- **[Examples](/examples/complete-workflows)** - Real-world scenarios

---

**Need help?** Check [Troubleshooting](/troubleshooting/common-issues) or [FAQ](/troubleshooting/faq).

