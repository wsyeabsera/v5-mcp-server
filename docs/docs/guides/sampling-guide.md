# MCP Sampling Guide

## What is Sampling?

**Sampling** is an MCP (Model Context Protocol) feature that allows an MCP server to request AI assistance from connected clients during tool execution. This enables servers to perform intelligent operations by leveraging the client's AI capabilities.

Think of it as the server asking the client's AI: "Can you help me analyze this data?" or "What's the best approach here?" The AI processes the request and returns insights that the server uses to complete its work.

## Why We Added Sampling

Our waste management MCP server now uses sampling to:

1. **Generate Intelligent Reports** - AI-powered analysis of facility health and performance
2. **Assess Risk Dynamically** - Real-time risk scoring based on contamination patterns and history
3. **Customize Inspections** - Generate targeted inspection questions based on facility needs

Without sampling, these tools would only return raw data. With sampling, they provide actionable insights.

## Architecture Overview

```
┌─────────────┐                    ┌─────────────┐
│   Client    │                    │   Server    │
│  (AI Model) │                    │  (Tools)    │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. User calls tool              │
       │─────────────────────────────────>│
       │                                  │
       │                                  │ 2. Server fetches
       │                                  │    data from DB
       │                                  │
       │  3. Server requests AI analysis  │
       │<─────────────────────────────────│
       │     (sampling request)           │
       │                                  │
       │  4. AI processes and responds    │
       │─────────────────────────────────>│
       │                                  │
       │                                  │ 5. Server combines
       │                                  │    data + AI insights
       │                                  │
       │  6. Return comprehensive result  │
       │<─────────────────────────────────│
       │                                  │
```

## Three AI-Powered Tools

### 1. Generate Intelligent Facility Report

**Tool:** `generate_intelligent_facility_report`

**Purpose:** Creates a comprehensive facility analysis report with AI-generated insights.

**Parameters:**
- `facilityId` (required): The facility ID to analyze
- `includeRecommendations` (optional): Whether to include AI recommendations (default: false)

**What it does:**
1. Fetches facility data, inspections, contaminants, and shipments
2. Calculates metrics (acceptance rates, contamination counts, etc.)
3. **Uses sampling** to request AI analysis of the data
4. Combines raw metrics with AI insights
5. Returns a comprehensive report

**Example Usage:**

```json
{
  "name": "generate_intelligent_facility_report",
  "arguments": {
    "facilityId": "65f1234567890abcdef12345",
    "includeRecommendations": true
  }
}
```

**Sample Output:**

```json
{
  "reportId": "RPT-1699234567890",
  "generatedAt": "2024-11-05T10:30:00.000Z",
  "facility": {
    "name": "Central Waste Processing",
    "location": "Rotterdam",
    "shortCode": "CWP-01"
  },
  "metrics": {
    "inspections": {
      "total": 45,
      "accepted": 38,
      "acceptanceRate": "84.44%"
    },
    "contamination": {
      "total": 12,
      "highRisk": 3,
      "riskPercentage": "25.00%"
    }
  },
  "aiAnalysis": {
    "rawAnalysis": "Based on the facility data analysis:\n\n1. **Overall Health Score: 78/100**\n   - Good acceptance rate...",
    "timestamp": "2024-11-05T10:30:05.000Z"
  }
}
```

### 2. Analyze Shipment Risk

**Tool:** `analyze_shipment_risk`

**Purpose:** Performs AI-powered risk assessment for a specific shipment.

**Parameters:**
- `shipmentId` (required): The shipment ID to analyze

**What it does:**
1. Fetches shipment details and related contaminants
2. Retrieves historical data for the shipment source
3. **Uses sampling** to request AI risk scoring (0-100)
4. Identifies risk factors and recommended actions
5. Returns comprehensive risk assessment

**Example Usage:**

```json
{
  "name": "analyze_shipment_risk",
  "arguments": {
    "shipmentId": "65f9876543210fedcba98765"
  }
}
```

**Sample Output:**

```json
{
  "shipmentId": "65f9876543210fedcba98765",
  "assessedAt": "2024-11-05T10:35:00.000Z",
  "shipment": {
    "source": "Industrial Metals Inc",
    "licensePlate": "AB-123-CD",
    "facility": "Central Waste Processing",
    "duration": "45 minutes"
  },
  "riskIndicators": {
    "currentContaminants": 2,
    "highRiskContaminants": 1,
    "sourceHistoryContaminants": 8,
    "sourceHistoryShipments": 6
  },
  "aiRiskScore": {
    "score": 65,
    "reasoning": "Moderate risk level due to detected contaminants..."
  },
  "riskFactors": [
    "High-risk contaminants present",
    "Source has contamination history"
  ],
  "recommendedActions": [
    "Immediate inspection required",
    "Enhanced monitoring for future shipments from this source"
  ]
}
```

### 3. Suggest Inspection Questions

**Tool:** `suggest_inspection_questions`

**Purpose:** Generates customized inspection questions based on facility history.

**Parameters:**
- `facilityId` (required): The facility ID to generate questions for

**What it does:**
1. Fetches recent facility activity (inspections, contaminants, shipments)
2. Calculates focus area metrics
3. **Uses elicitation** to determine which area needs most attention
4. **Uses sampling** to generate targeted inspection questions
5. Returns customized inspection checklist

**Example Usage:**

```json
{
  "name": "suggest_inspection_questions",
  "arguments": {
    "facilityId": "65f1234567890abcdef12345"
  }
}
```

**Sample Output:**

```json
{
  "facilityId": "65f1234567890abcdef12345",
  "facilityName": "Central Waste Processing",
  "generatedAt": "2024-11-05T10:40:00.000Z",
  "focusArea": "Contamination levels",
  "selectionMethod": "AI-assisted",
  "facilityMetrics": {
    "recentContaminants": 15,
    "acceptanceRate": "82.5%",
    "avgProcessingTime": "38 minutes",
    "complianceIssues": 2
  },
  "inspectionQuestions": [
    "Are contamination detection systems functioning properly?",
    "What protocols are in place for high-risk contamination events?",
    "Review recent contamination logs - are patterns emerging?",
    "Are staff trained on latest contamination identification procedures?",
    "Verify segregation procedures for contaminated waste streams"
  ],
  "additionalNotes": [
    "High contamination activity - extra vigilance required"
  ]
}
```

## Testing with MCP Inspector

The MCP Inspector allows you to test these sampling-powered tools interactively.

### Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Connect the Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:3000/sse
   ```

3. **Test the tools:**
   - In the Inspector UI, select one of the sampling tools
   - Fill in the required parameters
   - Execute the tool and observe the results

### What to Expect

The server includes a **mock AI implementation** for testing purposes. When sampling is requested:

1. The server logs the sampling request
2. A mock AI analyzes the prompt content
3. It returns appropriate responses based on the query type
4. The tool receives the AI response and completes execution

In a production environment, these mock responses would be replaced with real AI model responses from the connected client.

## How Sampling Works Technically

### Request Flow

1. **Tool Invocation**: Client calls a sampling-powered tool
2. **Data Collection**: Server fetches relevant data from MongoDB
3. **Sampling Request**: Server calls `requestAnalysis()`, `requestRiskScore()`, or `elicitChoice()`
4. **AI Processing**: Sampling callback processes the request (mock in testing, real AI in production)
5. **Response Integration**: Tool combines database data with AI insights
6. **Return Result**: Comprehensive result sent back to client

### Sampling Utilities

We provide three helper functions in `src/utils/sampling.ts`:

#### `requestAnalysis(prompt: string, data: any): Promise<string>`

Request general AI analysis with contextual data.

```typescript
const analysis = await requestAnalysis(
  'Analyze this facility for compliance risks',
  facilityData
);
```

#### `requestRiskScore(context: string): Promise<RiskScore>`

Request structured risk assessment (0-100 score + reasoning).

```typescript
const risk = await requestRiskScore(
  'Shipment from source with contamination history...'
);
// Returns: { score: 65, reasoning: "..." }
```

#### `elicitChoice(question: string, options: string[]): Promise<string>`

Request selection from multiple options (elicitation).

```typescript
const choice = await elicitChoice(
  'Which area needs most attention?',
  ['Contamination', 'Acceptance', 'Processing', 'Compliance']
);
// Returns: "Contamination"
```

### Error Handling

All sampling functions include:
- **30-second timeout**: Prevents hanging on slow/unresponsive AI
- **Graceful fallbacks**: Tools continue working if sampling fails
- **Comprehensive logging**: All requests/responses logged for debugging

Example error handling:

```typescript
try {
  const analysis = await requestAnalysis(prompt, data);
  report.aiAnalysis = analysis;
} catch (error) {
  logger.error('Sampling failed:', error);
  report.aiAnalysis = { error: 'AI analysis unavailable' };
  // Tool still returns useful data without AI insights
}
```

## Best Practices

### 1. Use Sampling Judiciously

Sampling adds latency and token costs. Use it when:
- ✅ Complex analysis provides significant value
- ✅ Data patterns are hard to detect algorithmically
- ✅ Human-like reasoning improves outcomes

Avoid when:
- ❌ Simple calculations suffice
- ❌ Real-time performance is critical
- ❌ Results are needed in milliseconds

### 2. Provide Rich Context

AI analysis quality depends on context. Include:
- Relevant data points and metrics
- Historical patterns
- Business rules and constraints
- Specific questions to answer

### 3. Handle Failures Gracefully

Always provide fallbacks:
```typescript
let aiScore = null;

if (isSamplingAvailable()) {
  try {
    aiScore = await requestRiskScore(context);
  } catch (error) {
    // Calculate fallback score
    aiScore = calculateBasicRiskScore(data);
  }
}
```

### 4. Log for Debugging

Sampling interactions should be logged:
- Request content (truncated if long)
- Response summaries
- Timing information
- Any errors

This helps debug issues and optimize prompts.

### 5. Optimize Prompts

Good prompts are:
- **Specific**: Clear about what analysis is needed
- **Structured**: Request formatted output when possible
- **Concise**: Include necessary context, not everything
- **Testable**: Verify prompts work with real data

## Adding Your Own Sampling Tools

Want to create new AI-powered tools? Here's how:

### Step 1: Define Your Tool

```typescript
// src/tools/myCustomTools.ts
export const myCustomTools = {
  my_ai_powered_tool: {
    description: 'Does something intelligent with AI',
    inputSchema: zodToJsonSchema(mySchema, { $refStrategy: 'none' }),
    handler: async (args) => {
      // Implementation
    }
  }
};
```

### Step 2: Fetch Your Data

```typescript
const data = await MyModel.find({ /* criteria */ });
const relatedData = await RelatedModel.find({ /* criteria */ });
```

### Step 3: Use Sampling

```typescript
import { requestAnalysis, isSamplingAvailable } from '../utils/sampling.js';

if (isSamplingAvailable()) {
  try {
    const aiInsights = await requestAnalysis(
      'What patterns do you see in this data?',
      { data, relatedData }
    );
    // Use aiInsights
  } catch (error) {
    // Handle gracefully
  }
}
```

### Step 4: Return Results

```typescript
return {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        data,
        aiInsights,
        timestamp: new Date()
      }, null, 2)
    }
  ]
};
```

### Step 5: Register Your Tool

```typescript
// src/tools/index.ts
export { myCustomTools } from './myCustomTools.js';

// src/index.ts
import { myCustomTools } from './tools/index.js';

const allTools = {
  ...existingTools,
  ...myCustomTools,
};
```

## Troubleshooting

### Sampling Request Times Out

**Cause**: AI model is slow or unresponsive

**Solutions**:
- Check server logs for timeout messages
- Reduce prompt complexity
- Simplify data context
- Verify mock callback is registered (in test mode)

### "Sampling not available" Error

**Cause**: Sampling callback not registered

**Solutions**:
- Ensure `setSamplingCallback()` is called at server startup
- Check that callback function is not null
- Verify server initialization completed successfully

### Mock Responses Don't Match My Data

**Cause**: Mock implementation uses generic responses

**Solutions**:
- For testing: Acceptable, demonstrates functionality
- For production: Replace mock with real AI integration
- Customize mock responses in `src/index.ts` if needed

### Tool Returns Data But No AI Analysis

**Cause**: Sampling failed but tool continued with fallback

**Solutions**:
- Check server logs for sampling errors
- Verify sampling callback is working
- Ensure timeout is sufficient for AI processing
- This is expected behavior (graceful degradation)

## Next Steps

1. **Test all three tools** with the MCP Inspector
2. **Review the logs** to understand sampling flow
3. **Experiment with prompts** by modifying the tool implementations
4. **Create custom tools** using sampling for your use cases
5. **Integrate with real AI** when moving to production

## Resources

- [MCP Specification - Sampling](https://spec.modelcontextprotocol.io/specification/client/sampling/)
- [MCP Inspector Documentation](https://github.com/modelcontextprotocol/inspector)
- Source Code: `src/tools/samplingTools.ts` (in repository root)
- Source Code: `src/utils/sampling.ts` (in repository root)

---

**Questions or issues?** Check the [Troubleshooting Guide](../troubleshooting/common-issues.md) or review server logs for detailed information.
