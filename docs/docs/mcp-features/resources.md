# MCP Resources

Learn how to expose readable data through MCP Resources for efficient AI access to your waste management system.

## What are Resources?

**MCP Resources** are readable data endpoints that allow AI assistants to directly access information from your server without calling tools. Think of them as "read-only views" into your data.

While tools are for **actions** (create, update, delete), resources are for **reading** static or semi-static data that the AI might need to reference.

### Real-World Analogy

Imagine a reference library:
- **Tools** are like asking the librarian to perform actions: "Please order this book," "Update this catalog entry," "Remove this damaged book"
- **Resources** are like reference books you can pick up and read directly: "List of all books," "Library statistics," "Recent acquisitions"

Resources are faster and more efficient for reading data because they don't require executing complex logic - they just return the current state.

## Why Use Resources?

### Benefits Over Tools

1. **Performance**: Direct data access without business logic execution
2. **Efficiency**: AI can read multiple resources in parallel
3. **Context**: Provides background information before taking actions
4. **Discovery**: Users can browse available data
5. **Caching**: Clients can cache resource data

### Resources vs Tools

| Aspect | Resources | Tools |
|--------|-----------|-------|
| Purpose | Reading data | Performing actions |
| Complexity | Simple data retrieval | Complex business logic |
| Side Effects | None (read-only) | Creates/modifies/deletes data |
| Use Case | "Show me X" | "Do Y" |
| Speed | Fast | Depends on action |

### When to Use Resources

Use resources for:
- System statistics and overview data
- Reference lists (all facilities, contracts)
- Recent activity feeds
- Configuration data
- Status dashboards

Use tools for:
- Creating, updating, or deleting records
- Complex queries with multiple filters
- Actions with side effects

## Resource Structure

Every MCP resource has:

### 1. URI (Unique Resource Identifier)
A unique identifier using a URI scheme:
```
facility://list
stats://overview
facility://507f1f77bcf86cd799439011
```

### 2. Name
Human-readable name shown to users:
```
All Facilities
System Overview Statistics
Facility: Main Plant (MP01)
```

### 3. Description
What data the resource contains:
```
List of all waste management facilities with basic information
```

### 4. MIME Type
Content type (usually `application/json`):
```
application/json
```

### 5. Contents
The actual data returned when the resource is read:
```json
{
  "uri": "stats://overview",
  "mimeType": "application/json",
  "text": "{\"facilities\": 5, \"contaminants\": 142}"
}
```

## URI Schemes

### Static Resources
Resources that always exist:
```
facility://list          - All facilities
stats://overview         - System statistics
activity://recent        - Recent activity feed
```

### Dynamic Resources
Resources generated based on data:
```
facility://507f1f77bcf86cd799439011    - Specific facility by ID
contract://507f1f77bcf86cd799439012    - Specific contract by ID
```

### Pattern Matching
Use regex to handle dynamic URIs:
```typescript
const facilityMatch = uri.match(/^facility:\/\/([a-f0-9]{24})$/);
if (facilityMatch) {
  const facilityId = facilityMatch[1];
  // Fetch facility data
}
```

## Implementation Steps

### Step 1: Create the Resources File

Create a new file at `src/resources/index.ts`:

```typescript
import { Facility, Contaminant, Inspection, Shipment, Contract } from '../models/index.js';

// Define available static resources
export const resources = {
  'facility://list': {
    uri: 'facility://list',
    name: 'All Facilities',
    description: 'List of all waste management facilities',
    mimeType: 'application/json'
  },
  
  'stats://overview': {
    uri: 'stats://overview',
    name: 'System Overview Statistics',
    description: 'Overall statistics for facilities, contaminants, inspections, and shipments',
    mimeType: 'application/json'
  },

  'activity://recent': {
    uri: 'activity://recent',
    name: 'Recent Activity',
    description: 'Recent inspections, shipments, and contamination detections (last 10 of each)',
    mimeType: 'application/json'
  },

  'contaminant://summary': {
    uri: 'contaminant://summary',
    name: 'Contamination Summary',
    description: 'Summary of contamination levels across all facilities',
    mimeType: 'application/json'
  }
};

// Handler to read resource content
export async function readResource(uri: string) {
  // Static resource: All facilities
  if (uri === 'facility://list') {
    const facilities = await Facility.find().select('name shortCode location createdAt');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            total: facilities.length,
            facilities: facilities
          }, null, 2)
        }
      ]
    };
  }

  // Static resource: System statistics
  if (uri === 'stats://overview') {
    const [facilityCount, contaminantCount, inspectionCount, shipmentCount, contractCount] = 
      await Promise.all([
        Facility.countDocuments(),
        Contaminant.countDocuments(),
        Inspection.countDocuments(),
        Shipment.countDocuments(),
        Contract.countDocuments()
      ]);

    // Get additional statistics
    const recentInspections = await Inspection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const acceptedInspections = await Inspection.countDocuments({
      is_delivery_accepted: true
    });

    const acceptanceRate = inspectionCount > 0 
      ? ((acceptedInspections / inspectionCount) * 100).toFixed(2)
      : '0.00';

    const stats = {
      overview: {
        facilities: facilityCount,
        contaminants: contaminantCount,
        inspections: inspectionCount,
        shipments: shipmentCount,
        contracts: contractCount
      },
      metrics: {
        inspectionsLast30Days: recentInspections,
        overallAcceptanceRate: `${acceptanceRate}%`
      },
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(stats, null, 2)
        }
      ]
    };
  }

  // Static resource: Recent activity
  if (uri === 'activity://recent') {
    const [recentInspections, recentShipments, recentContaminants] = await Promise.all([
      Inspection.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('facility_id', 'name shortCode')
        .lean(),
      Shipment.find()
        .sort({ entry_timestamp: -1 })
        .limit(10)
        .populate('facilityId', 'name shortCode')
        .lean(),
      Contaminant.find()
        .sort({ detection_time: -1 })
        .limit(10)
        .populate('facilityId', 'name shortCode')
        .lean()
    ]);

    const activity = {
      recentInspections,
      recentShipments,
      recentContaminants,
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(activity, null, 2)
        }
      ]
    };
  }

  // Static resource: Contamination summary
  if (uri === 'contaminant://summary') {
    const contaminants = await Contaminant.find().lean();
    
    const summary = {
      total: contaminants.length,
      byLevel: {
        explosive: {
          low: contaminants.filter(c => c.explosive_level === 'low').length,
          medium: contaminants.filter(c => c.explosive_level === 'medium').length,
          high: contaminants.filter(c => c.explosive_level === 'high').length
        },
        hcl: {
          low: contaminants.filter(c => c.hcl_level === 'low').length,
          medium: contaminants.filter(c => c.hcl_level === 'medium').length,
          high: contaminants.filter(c => c.hcl_level === 'high').length
        },
        so2: {
          low: contaminants.filter(c => c.so2_level === 'low').length,
          medium: contaminants.filter(c => c.so2_level === 'medium').length,
          high: contaminants.filter(c => c.so2_level === 'high').length
        }
      },
      byMaterial: contaminants.reduce((acc, c) => {
        acc[c.material] = (acc[c.material] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(summary, null, 2)
        }
      ]
    };
  }

  // Dynamic resource: Individual facility by ID
  const facilityMatch = uri.match(/^facility:\/\/([a-f0-9]{24})$/);
  if (facilityMatch) {
    const facilityId = facilityMatch[1];
    const facility = await Facility.findById(facilityId).lean();
    
    if (!facility) {
      throw new Error('Facility not found');
    }
    
    // Get related data for the facility
    const [contaminants, inspections, shipments] = await Promise.all([
      Contaminant.find({ facilityId }).sort({ detection_time: -1 }).limit(20).lean(),
      Inspection.find({ facility_id: facilityId }).sort({ createdAt: -1 }).limit(20).lean(),
      Shipment.find({ facilityId }).sort({ entry_timestamp: -1 }).limit(20).lean()
    ]);

    // Calculate facility-specific metrics
    const acceptedInspections = inspections.filter(i => i.is_delivery_accepted).length;
    const acceptanceRate = inspections.length > 0
      ? ((acceptedInspections / inspections.length) * 100).toFixed(2)
      : '0.00';

    const facilityData = {
      facility,
      metrics: {
        totalInspections: inspections.length,
        acceptanceRate: `${acceptanceRate}%`,
        totalContaminants: contaminants.length,
        totalShipments: shipments.length
      },
      recentActivity: {
        contaminants: contaminants.slice(0, 5),
        inspections: inspections.slice(0, 5),
        shipments: shipments.slice(0, 5)
      },
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(facilityData, null, 2)
        }
      ]
    };
  }

  // Dynamic resource: Individual contract by ID
  const contractMatch = uri.match(/^contract:\/\/([a-f0-9]{24})$/);
  if (contractMatch) {
    const contractId = contractMatch[1];
    const contract = await Contract.findById(contractId).lean();
    
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Find related shipments and inspections
    const shipments = await Shipment.find({ contractId }).sort({ entry_timestamp: -1 }).lean();
    const inspections = await Inspection.find({ contract_reference_id: contractId }).lean();

    const contractData = {
      contract,
      metrics: {
        totalShipments: shipments.length,
        totalInspections: inspections.length
      },
      recentShipments: shipments.slice(0, 10),
      timestamp: new Date().toISOString()
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(contractData, null, 2)
        }
      ]
    };
  }

  // Unknown resource
  throw new Error(`Unknown resource URI: ${uri}`);
}

// Handler to list all available resources
export async function listResources() {
  // Start with static resources
  const staticResources = Object.values(resources);

  // Add dynamic facility resources
  const facilities = await Facility.find().select('_id name shortCode').lean();
  const facilityResources = facilities.map(facility => ({
    uri: `facility://${facility._id}`,
    name: `Facility: ${facility.name} (${facility.shortCode})`,
    description: `Complete data for facility ${facility.name} including metrics and recent activity`,
    mimeType: 'application/json'
  }));

  // Add dynamic contract resources
  const contracts = await Contract.find().select('_id producerName debitorName').lean();
  const contractResources = contracts.map(contract => ({
    uri: `contract://${contract._id}`,
    name: `Contract: ${contract.producerName} → ${contract.debitorName}`,
    description: `Contract details with related shipments and inspections`,
    mimeType: 'application/json'
  }));

  return {
    resources: [...staticResources, ...facilityResources, ...contractResources]
  };
}
```

### Step 2: Update Server Capabilities

In `src/index.ts`, update the `initialize` method:

```typescript
// Handle initialize
if (method === 'initialize') {
  logger.info('[MCP] Handling initialize');
  return res.json({
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: 'waste-management-mcp-server',
        version: '1.0.0',
      },
      capabilities: {
        tools: {},
        prompts: {},
        resources: {           // Add this
          subscribe: false,    // We don't support subscriptions yet
          listChanged: false   // We don't notify of list changes
        }
      },
    },
    id,
  });
}
```

### Step 3: Add Resource Imports

At the top of `src/index.ts`:

```typescript
import { listResources, readResource } from './resources/index.js';
```

### Step 4: Implement resources/list Handler

Add this handler in `src/index.ts`:

```typescript
// Handle resources/list
if (method === 'resources/list') {
  logger.info('[MCP] Handling resources/list');
  try {
    const result = await listResources();
    return res.json({
      jsonrpc: '2.0',
      result,
      id,
    });
  } catch (error: any) {
    logger.error('[MCP] Error listing resources:', error);
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: `Error listing resources: ${error.message}`
      },
      id,
    });
  }
}
```

### Step 5: Implement resources/read Handler

Add this handler in `src/index.ts`:

```typescript
// Handle resources/read
if (method === 'resources/read') {
  const uri = params?.uri;
  logger.info(`[MCP] Handling resources/read for: ${uri}`);

  try {
    const result = await readResource(uri);
    return res.json({
      jsonrpc: '2.0',
      result,
      id,
    });
  } catch (error: any) {
    logger.error(`[MCP] Error reading resource ${uri}:`, error);
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: error.message
      },
      id,
    });
  }
}
```

## Waste Management Examples

### Example 1: System Statistics

**Resource**: `stats://overview`

**Purpose**: Get overall system metrics

**Use Case**: Dashboard overview, compliance reporting

**Response**:
```json
{
  "overview": {
    "facilities": 5,
    "contaminants": 142,
    "inspections": 89,
    "shipments": 234,
    "contracts": 12
  },
  "metrics": {
    "inspectionsLast30Days": 23,
    "overallAcceptanceRate": "85.39%"
  },
  "timestamp": "2025-11-01T10:30:00.000Z"
}
```

### Example 2: Facility List

**Resource**: `facility://list`

**Purpose**: Get all facilities with basic info

**Use Case**: Selecting a facility, overview lists

**Response**:
```json
{
  "total": 5,
  "facilities": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Main Processing Plant",
      "shortCode": "MPP",
      "location": "Industrial Zone A",
      "createdAt": "2025-01-15T08:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Secondary Facility",
      "shortCode": "SF01",
      "location": "Industrial Zone B",
      "createdAt": "2025-02-01T09:00:00.000Z"
    }
  ]
}
```

### Example 3: Specific Facility Details

**Resource**: `facility://507f1f77bcf86cd799439011`

**Purpose**: Get complete data for one facility

**Use Case**: Facility deep-dive, detailed analysis

**Response**:
```json
{
  "facility": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Main Processing Plant",
    "shortCode": "MPP",
    "location": "Industrial Zone A"
  },
  "metrics": {
    "totalInspections": 45,
    "acceptanceRate": "88.89%",
    "totalContaminants": 12,
    "totalShipments": 98
  },
  "recentActivity": {
    "contaminants": [...],
    "inspections": [...],
    "shipments": [...]
  },
  "timestamp": "2025-11-01T10:30:00.000Z"
}
```

### Example 4: Recent Activity Feed

**Resource**: `activity://recent`

**Purpose**: See recent system activity

**Use Case**: Monitoring dashboard, recent events view

**Response**:
```json
{
  "recentInspections": [
    {
      "_id": "...",
      "facility_id": {
        "name": "Main Processing Plant",
        "shortCode": "MPP"
      },
      "is_delivery_accepted": true,
      "createdAt": "2025-11-01T09:15:00.000Z"
    }
  ],
  "recentShipments": [...],
  "recentContaminants": [...],
  "timestamp": "2025-11-01T10:30:00.000Z"
}
```

### Example 5: Contamination Summary

**Resource**: `contaminant://summary`

**Purpose**: Overview of contamination across the system

**Use Case**: Safety reports, trend analysis

**Response**:
```json
{
  "total": 142,
  "byLevel": {
    "explosive": {
      "low": 89,
      "medium": 42,
      "high": 11
    },
    "hcl": {
      "low": 95,
      "medium": 35,
      "high": 12
    },
    "so2": {
      "low": 102,
      "medium": 30,
      "high": 10
    }
  },
  "byMaterial": {
    "plastic": 45,
    "metal": 32,
    "organic": 28,
    "mixed": 37
  },
  "timestamp": "2025-11-01T10:30:00.000Z"
}
```

## Testing with MCP Inspector

### Step 1: Start Your Server

```bash
npm run dev
```

### Step 2: Launch MCP Inspector

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

### Step 3: List Available Resources

```json
{
  "method": "resources/list"
}
```

You should see all static resources plus dynamic resources for each facility and contract.

### Step 4: Read a Static Resource

```json
{
  "method": "resources/read",
  "params": {
    "uri": "stats://overview"
  }
}
```

### Step 5: Read a Dynamic Resource

First, get a facility ID from the list, then:

```json
{
  "method": "resources/read",
  "params": {
    "uri": "facility://507f1f77bcf86cd799439011"
  }
}
```

### Step 6: Verify JSON Parsing

The response should have properly formatted JSON in the `text` field. Copy it and verify it parses correctly.

## Best Practices

### 1. Consistent URI Schemes

Use consistent naming patterns:

✅ Good:
```
facility://list
facility://507f1f77bcf86cd799439011
contract://list
contract://507f1f77bcf86cd799439012
```

❌ Bad:
```
facilities
facility_507f1f77bcf86cd799439011
getAllContracts
contract-507f1f77bcf86cd799439012
```

### 2. Include Timestamps

Always include a timestamp in your resource data:

```typescript
{
  ...data,
  timestamp: new Date().toISOString()
}
```

### 3. Limit Data Volume

For list resources, consider pagination or limits:

```typescript
const facilities = await Facility.find()
  .limit(100)  // Don't return thousands of records
  .lean();
```

### 4. Add Metrics and Context

Enhance raw data with calculated metrics:

```typescript
{
  facility,
  metrics: {
    acceptanceRate: "88.89%",
    totalShipments: 98
  }
}
```

### 5. Use `.lean()` for Performance

When reading data without modifications:

```typescript
const facilities = await Facility.find().lean();  // Returns plain objects
```

### 6. Proper Error Handling

Return descriptive errors:

```typescript
if (!facility) {
  throw new Error(`Facility not found with ID: ${facilityId}`);
}
```

### 7. Resource Naming

Make names descriptive and user-friendly:

✅ Good:
```
name: 'Facility: Main Processing Plant (MPP)'
description: 'Complete data for facility including metrics and recent activity'
```

❌ Bad:
```
name: 'facility_507f1f77bcf86cd799439011'
description: 'facility data'
```

## Common Pitfalls

### Pitfall 1: Returning Too Much Data

❌ Bad:
```typescript
// Returns 10,000 records with all fields
const facilities = await Facility.find();
```

✅ Good:
```typescript
// Returns limited records with essential fields
const facilities = await Facility.find()
  .select('name shortCode location')
  .limit(100)
  .lean();
```

### Pitfall 2: Not Handling Missing Data

❌ Bad:
```typescript
const facility = await Facility.findById(facilityId);
return { facility };  // facility could be null
```

✅ Good:
```typescript
const facility = await Facility.findById(facilityId);
if (!facility) {
  throw new Error('Facility not found');
}
return { facility };
```

### Pitfall 3: Invalid URI Patterns

❌ Bad:
```typescript
// Doesn't validate ObjectId format
const facilityMatch = uri.match(/^facility:\/\/(.+)$/);
```

✅ Good:
```typescript
// Validates 24-character hex string (MongoDB ObjectId)
const facilityMatch = uri.match(/^facility:\/\/([a-f0-9]{24})$/);
```

### Pitfall 4: Inconsistent Response Format

Always return content in the same structure:

```typescript
return {
  contents: [
    {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2)
    }
  ]
};
```

### Pitfall 5: Forgetting to Update Capabilities

Don't forget to add `resources` to your server capabilities.

### Pitfall 6: Not Using Parallel Queries

❌ Bad (Sequential):
```typescript
const facilities = await Facility.countDocuments();
const contaminants = await Contaminant.countDocuments();
const inspections = await Inspection.countDocuments();
```

✅ Good (Parallel):
```typescript
const [facilities, contaminants, inspections] = await Promise.all([
  Facility.countDocuments(),
  Contaminant.countDocuments(),
  Inspection.countDocuments()
]);
```

## Advanced: Resource Subscriptions

:::info
The current implementation sets `subscribe: false` in capabilities. Resource subscriptions allow clients to be notified when resource data changes. This is an advanced feature for future enhancement.
:::

To support subscriptions in the future:

1. Set `subscribe: true` and `listChanged: true` in capabilities
2. Implement `resources/subscribe` handler
3. Implement `resources/unsubscribe` handler
4. Send notifications when data changes
5. Track active subscriptions

This requires WebSocket or SSE support for server-to-client notifications.

## Related Resources

- [MCP Prompts](./prompts.md) - Create workflow templates
- [MCP Sampling](./sampling.md) - Server-initiated AI requests
- [Data Models](../architecture/data-models.md) - Understanding the data structure
- [Best Practices](../guides/best-practices.md) - General MCP best practices

## Next Steps

Now that you understand resources:
1. Implement the resource handlers in your server
2. Test with MCP Inspector
3. Create custom resources for your specific needs
4. Learn about [Sampling](./sampling.md) for server-initiated AI analysis

:::tip
Start with 3-4 static resources for your most common data views, then add dynamic resources for detail views.
:::

