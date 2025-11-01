# MCP Prompts

Learn how to create reusable workflow templates with MCP Prompts for your waste management server.

## What are Prompts?

**MCP Prompts** are pre-defined, reusable workflow templates that guide AI interactions. Think of them as "saved questions" or "workflow shortcuts" that users can invoke with specific arguments.

Instead of users typing out long, detailed instructions every time they want to perform a common task, they can simply invoke a prompt with the necessary parameters. The prompt then generates a complete, well-structured message that the AI can execute.

### Real-World Analogy

Imagine you're ordering coffee:
- **Without prompts**: "I'd like a medium-sized cup of your house blend coffee, heated to 160 degrees, with two pumps of vanilla syrup, oat milk, and light foam on top."
- **With prompts**: "One vanilla oat milk latte, medium" - the barista knows the template and fills in the details.

Prompts work the same way - you provide the essential parameters, and the prompt fills in the complete workflow.

## Why Use Prompts?

### Benefits

1. **Consistency**: Ensures tasks are performed the same way every time
2. **Efficiency**: Users don't need to remember complex instructions
3. **Discoverability**: Users can see what workflows are available
4. **Reduced Errors**: Pre-validated workflows reduce mistakes
5. **Onboarding**: New users can quickly access common operations

### When to Use Prompts

Use prompts for:
- Common, repeatable workflows (compliance checks, reports)
- Multi-step analysis tasks (facility comparisons, trend analysis)
- Guided data entry (creating records with context)
- Report generation (weekly summaries, incident reports)

Don't use prompts for:
- Simple one-tool operations (just use the tool directly)
- Highly dynamic workflows (that change based on data)
- Rare, one-off tasks

## Prompt Structure

Every MCP prompt has three key components:

### 1. Name
A unique identifier for the prompt (kebab-case recommended)
```
analyze-facility-compliance
```

### 2. Description
What the prompt does (shown to users when browsing)
```
Analyze a facility's compliance based on recent inspections and contamination data
```

### 3. Arguments
Parameters users must provide when invoking the prompt
```typescript
arguments: [
  {
    name: 'facilityId',
    description: 'The ID of the facility to analyze',
    required: true
  },
  {
    name: 'timeRange',
    description: 'Time range for analysis (e.g., "30days", "90days")',
    required: false
  }
]
```

### 4. Messages
The actual instructions generated when the prompt is invoked
```typescript
messages: [
  {
    role: 'user',
    content: {
      type: 'text',
      text: 'Please analyze facility...'
    }
  }
]
```

## Implementation Steps

### Step 1: Create the Prompts File

Create a new file at `src/prompts/index.ts`:

```typescript
export const prompts = {
  'analyze-facility-compliance': {
    name: 'analyze-facility-compliance',
    description: 'Analyze a facility\'s compliance based on recent inspections and contamination data',
    arguments: [
      {
        name: 'facilityId',
        description: 'The ID of the facility to analyze',
        required: true
      },
      {
        name: 'timeRange',
        description: 'Time range for analysis (e.g., "30days", "90days")',
        required: false
      }
    ]
  },
  
  'generate-contamination-report': {
    name: 'generate-contamination-report',
    description: 'Generate a comprehensive contamination report for a facility',
    arguments: [
      {
        name: 'facilityId',
        description: 'The ID of the facility',
        required: true
      },
      {
        name: 'includeRecommendations',
        description: 'Whether to include recommendations (true/false)',
        required: false
      }
    ]
  },

  'review-shipment-inspection': {
    name: 'review-shipment-inspection',
    description: 'Review a shipment and its inspection results',
    arguments: [
      {
        name: 'shipmentId',
        description: 'The ID of the shipment to review',
        required: true
      }
    ]
  },

  'compare-facilities-performance': {
    name: 'compare-facilities-performance',
    description: 'Compare performance metrics across multiple facilities',
    arguments: [
      {
        name: 'facilityIds',
        description: 'Comma-separated list of facility IDs to compare',
        required: true
      },
      {
        name: 'metric',
        description: 'Metric to compare (compliance, contamination, efficiency)',
        required: false
      }
    ]
  }
};
```

### Step 2: Update Server Capabilities

In `src/index.ts`, update the `initialize` method to advertise prompt support:

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
        prompts: {},  // Add this line
      },
    },
    id,
  });
}
```

### Step 3: Add Prompt Import

At the top of `src/index.ts`, add the import:

```typescript
import { prompts } from './prompts/index.js';
```

### Step 4: Implement prompts/list Handler

Add this handler in `src/index.ts` (after the `tools/list` handler):

```typescript
// Handle prompts/list
if (method === 'prompts/list') {
  logger.info('[MCP] Handling prompts/list');
  return res.json({
    jsonrpc: '2.0',
    result: {
      prompts: Object.values(prompts)
    },
    id,
  });
}
```

### Step 5: Implement prompts/get Handler

Add this handler in `src/index.ts` (after the `prompts/list` handler):

```typescript
// Handle prompts/get
if (method === 'prompts/get') {
  const promptName = params?.name;
  logger.info(`[MCP] Handling prompts/get for: ${promptName}`);

  const prompt = prompts[promptName as keyof typeof prompts];
  
  if (!prompt) {
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: `Unknown prompt: ${promptName}`
      },
      id,
    });
  }

  // Generate prompt messages based on arguments
  const args = params?.arguments || {};
  let messages = [];

  if (promptName === 'analyze-facility-compliance') {
    const { facilityId, timeRange = '30days' } = args;
    messages = [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please analyze the compliance status of facility ID: ${facilityId} over the last ${timeRange}.

Review the following:
1. Recent inspections and their results (acceptance rates, conditions met)
2. Contamination detections and severity levels (explosive, HCL, SO2)
3. Shipment patterns and acceptance rates
4. Overall compliance trends

Use the available tools to gather this information:
- Use list_inspections with facilityId filter
- Use list_contaminants with facilityId filter
- Use list_shipments with facilityId filter
- Use get_facility to get facility details

Provide a comprehensive analysis with:
- Summary of findings
- Key compliance metrics
- Areas of concern
- Recommendations for improvement`
        }
      }
    ];
  } else if (promptName === 'generate-contamination-report') {
    const { facilityId, includeRecommendations = 'true' } = args;
    const shouldIncludeRecs = includeRecommendations === 'true';
    
    messages = [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Generate a comprehensive contamination report for facility ID: ${facilityId}.

Include the following sections:

1. **Executive Summary**
   - Total contamination detections
   - Most common contaminant types
   - Overall severity assessment

2. **Detailed Analysis**
   - Contamination by type (material breakdown)
   - Severity levels (explosive, HCL, SO2)
   - Timeline and patterns
   - Associated shipments

3. **Facility Context**
   - Facility information and location
   - Recent operational activity

${shouldIncludeRecs ? `4. **Recommendations**
   - Immediate actions required
   - Process improvements
   - Prevention strategies` : ''}

Use these tools to gather data:
- get_facility for facility details
- list_contaminants with facilityId filter
- list_shipments with facilityId filter for context

Format the report professionally with clear sections and data visualization where appropriate.`
        }
      }
    ];
  } else if (promptName === 'review-shipment-inspection') {
    const { shipmentId } = args;
    messages = [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Review shipment ID: ${shipmentId} and its associated inspection.

Perform a comprehensive review covering:

1. **Shipment Details**
   - Entry and exit timestamps
   - Source and destination
   - License plate information
   - Contract reference

2. **Inspection Results**
   - Acceptance status
   - Conditions compliance
   - Waste types detected and percentages
   - Heating value calculation
   - Waste producer information

3. **Compliance Check**
   - Contract alignment
   - Waste code verification
   - Any deviations or concerns

4. **Contamination Analysis**
   - Any contaminants detected in this shipment
   - Severity levels

Use these tools:
- get_shipment to retrieve shipment details
- list_inspections filtered by the shipment's contract or facility
- list_contaminants filtered by shipment_id
- get_contract using the contract reference

Provide a summary with any red flags, concerns, or items requiring follow-up.`
        }
      }
    ];
  } else if (promptName === 'compare-facilities-performance') {
    const { facilityIds, metric = 'overall' } = args;
    messages = [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Compare the performance of facilities with IDs: ${facilityIds}

Focus on the ${metric} metric${metric === 'overall' ? 's' : ''}.

For each facility, analyze:

1. **Inspection Performance**
   - Total inspections conducted
   - Acceptance rate (percentage of accepted deliveries)
   - Conditions compliance rate

2. **Contamination Metrics**
   - Total contamination detections
   - Average severity levels
   - Most common contaminant types

3. **Operational Efficiency**
   - Shipment volume
   - Processing times (entry to exit)
   - Contract compliance

4. **Overall Compliance Score**
   - Combined assessment based on above metrics

Use these tools for each facility:
- get_facility for facility information
- list_inspections with facilityId filter
- list_contaminants with facilityId filter
- list_shipments with facilityId filter

Present the comparison in a clear format:
- Side-by-side comparison table
- Highlight best and worst performers
- Identify trends and patterns
- Provide actionable insights

Rank the facilities and explain the ranking rationale.`
        }
      }
    ];
  }

  return res.json({
    jsonrpc: '2.0',
    result: {
      description: prompt.description,
      messages
    },
    id,
  });
}
```

## Waste Management Examples

### Example 1: Analyze Facility Compliance

**Purpose**: Review a facility's compliance over a time period

**Arguments**:
- `facilityId` (required): The facility to analyze
- `timeRange` (optional): e.g., "30days", "90days"

**What it does**:
1. Retrieves all inspections for the facility
2. Gets contamination detections
3. Reviews shipment patterns
4. Generates a compliance analysis with recommendations

**JSON-RPC Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "prompts/get",
  "params": {
    "name": "analyze-facility-compliance",
    "arguments": {
      "facilityId": "507f1f77bcf86cd799439011",
      "timeRange": "90days"
    }
  }
}
```

### Example 2: Generate Contamination Report

**Purpose**: Create a comprehensive contamination report for a facility

**Arguments**:
- `facilityId` (required): The facility to report on
- `includeRecommendations` (optional): "true" or "false"

**What it does**:
1. Lists all contamination detections
2. Analyzes severity levels and types
3. Identifies patterns and trends
4. Optionally provides recommendations

**JSON-RPC Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "prompts/get",
  "params": {
    "name": "generate-contamination-report",
    "arguments": {
      "facilityId": "507f1f77bcf86cd799439011",
      "includeRecommendations": "true"
    }
  }
}
```

### Example 3: Review Shipment Inspection

**Purpose**: Comprehensive review of a shipment and its inspection

**Arguments**:
- `shipmentId` (required): The shipment to review

**What it does**:
1. Gets shipment details
2. Finds associated inspection records
3. Checks contract compliance
4. Identifies any contamination issues

**JSON-RPC Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "prompts/get",
  "params": {
    "name": "review-shipment-inspection",
    "arguments": {
      "shipmentId": "507f1f77bcf86cd799439012"
    }
  }
}
```

### Example 4: Compare Facilities Performance

**Purpose**: Compare multiple facilities across performance metrics

**Arguments**:
- `facilityIds` (required): Comma-separated list of facility IDs
- `metric` (optional): "compliance", "contamination", "efficiency", or "overall"

**What it does**:
1. Gathers data for each facility
2. Calculates performance metrics
3. Creates a comparative analysis
4. Ranks facilities and provides insights

**JSON-RPC Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "prompts/get",
  "params": {
    "name": "compare-facilities-performance",
    "arguments": {
      "facilityIds": "507f1f77bcf86cd799439011,507f1f77bcf86cd799439012,507f1f77bcf86cd799439013",
      "metric": "compliance"
    }
  }
}
```

## Testing with MCP Inspector

### Step 1: Start Your Server

```bash
npm run dev
```

Server should be running on `http://localhost:3000`

### Step 2: Launch MCP Inspector

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse
```

### Step 3: List Available Prompts

In the Inspector, execute:
```json
{
  "method": "prompts/list"
}
```

You should see all 4 prompts listed with their descriptions and arguments.

### Step 4: Test a Prompt

First, create a facility to test with:
```json
{
  "method": "tools/call",
  "params": {
    "name": "create_facility",
    "arguments": {
      "name": "Test Facility",
      "shortCode": "TF01",
      "location": "Test Location"
    }
  }
}
```

Copy the facility ID from the response, then invoke a prompt:
```json
{
  "method": "prompts/get",
  "params": {
    "name": "analyze-facility-compliance",
    "arguments": {
      "facilityId": "YOUR_FACILITY_ID_HERE",
      "timeRange": "30days"
    }
  }
}
```

The response will contain the generated message that the AI should execute.

### Step 5: Verify in Cursor

Add your server to Cursor's MCP settings and try invoking prompts through the AI assistant.

## Best Practices

### 1. Clear, Descriptive Names

✅ Good:
```
analyze-facility-compliance
generate-monthly-report
review-inspection-results
```

❌ Bad:
```
prompt1
doAnalysis
check
```

### 2. Comprehensive Descriptions

✅ Good:
```
Analyze a facility's compliance based on recent inspections, 
contamination detections, and shipment patterns over a 
specified time range
```

❌ Bad:
```
Checks stuff
Facility analysis
```

### 3. Required vs Optional Arguments

Make arguments required only if the prompt cannot function without them:

```typescript
arguments: [
  {
    name: 'facilityId',
    required: true  // Can't analyze without knowing which facility
  },
  {
    name: 'timeRange',
    required: false  // Can default to 30 days
  }
]
```

### 4. Detailed Prompt Messages

Provide complete instructions in the generated message:
- List specific tools to use
- Specify the order of operations
- Define the expected output format
- Include all relevant context

### 5. Argument Validation

Validate arguments before generating messages:

```typescript
if (!facilityId || facilityId.length !== 24) {
  return res.json({
    jsonrpc: '2.0',
    error: {
      code: -32602,
      message: 'Invalid facilityId: must be a 24-character MongoDB ObjectId'
    },
    id,
  });
}
```

### 6. Default Values

Provide sensible defaults for optional arguments:

```typescript
const { facilityId, timeRange = '30days' } = args;
```

### 7. Prompt Composition

Break complex workflows into multiple prompts rather than creating one mega-prompt:

✅ Good:
- `analyze-facility-compliance`
- `generate-contamination-report`
- `review-shipment-inspection`

❌ Bad:
- `do-everything-facility-analysis-report-review`

## Common Pitfalls

### Pitfall 1: Too Generic Messages

❌ Bad:
```typescript
messages = [{
  role: 'user',
  content: {
    type: 'text',
    text: 'Analyze the facility'
  }
}];
```

✅ Good:
```typescript
messages = [{
  role: 'user',
  content: {
    type: 'text',
    text: `Analyze facility ${facilityId} for compliance.
    
    Steps:
    1. Use get_facility to get facility details
    2. Use list_inspections with facilityId filter
    3. Calculate acceptance rate
    4. Summarize findings
    
    Provide a structured report with metrics and recommendations.`
  }
}];
```

### Pitfall 2: Missing Error Handling

Always handle missing or invalid prompts:

```typescript
if (!prompt) {
  return res.json({
    jsonrpc: '2.0',
    error: {
      code: -32602,
      message: `Unknown prompt: ${promptName}`
    },
    id,
  });
}
```

### Pitfall 3: Not Using Arguments

If a prompt has arguments, use them in the generated message:

```typescript
const { facilityId, timeRange } = args;
// Then reference facilityId and timeRange in your message
```

### Pitfall 4: Forgetting to Update Capabilities

Don't forget to add `prompts: {}` to your server capabilities in the initialize handler.

## Related Resources

- [MCP Resources](./resources.md) - Learn about exposing readable data
- [MCP Sampling](./sampling.md) - Server-initiated AI requests
- [Cursor Integration Guide](../guides/cursor-integration.md) - Using prompts in Cursor
- [Best Practices](../guides/best-practices.md) - General MCP best practices

## Next Steps

Now that you understand prompts, learn about:
1. **[Resources](./resources.md)** - Expose data for direct reading
2. **[Sampling](./sampling.md)** - Request AI analysis from your server
3. **Creating custom prompts** for your specific workflows

:::tip
Start with 2-3 prompts for your most common workflows, then expand based on user feedback.
:::

