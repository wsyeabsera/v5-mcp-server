# MCP Sampling

Learn how to enable your MCP server to request AI analysis and generation directly - server-initiated LLM interactions.

## What is Sampling?

**MCP Sampling** allows your server to request text generation from the AI (LLM) that's connected to your MCP server. This is the opposite of the normal flow:

- **Normal Flow**: User → AI → MCP Server (AI calls your tools)
- **Sampling Flow**: MCP Server → AI → Response (Your server asks AI to generate text)

Think of sampling as your server having the ability to "ask the AI a question" or "request analysis" programmatically.

### Real-World Analogy

Imagine a workplace scenario:
- **Normal Flow (Tools)**: Your boss asks their assistant to file documents in your filing system. The assistant uses your filing tools.
- **Sampling Flow**: Your filing system detects a pattern and asks the assistant: "Can you write a summary of these documents I found?" The assistant analyzes and responds.

Sampling lets your server delegate thinking, analysis, and generation tasks to the AI.

## Why Use Sampling?

### Benefits

1. **Automated Analysis**: Your server can request AI analysis of data without user intervention
2. **Smart Processing**: Add AI reasoning to your backend workflows
3. **Content Generation**: Generate reports, summaries, or insights automatically
4. **Intelligent Defaults**: Use AI to suggest values or detect patterns
5. **Scheduled Tasks**: Run AI-powered analysis on a schedule

### Use Cases for Waste Management

1. **Automated Compliance Analysis**: Analyze inspection data when new records arrive
2. **Contamination Pattern Detection**: Ask AI to identify trends in contamination data
3. **Report Generation**: Auto-generate weekly/monthly compliance reports
4. **Alert Prioritization**: Use AI to determine which issues need immediate attention
5. **Data Quality Checks**: Request AI to identify anomalies in incoming data

## When to Use Sampling vs Tools

| Feature | Tools | Sampling |
|---------|-------|----------|
| Initiated by | User/AI | Your server |
| Direction | AI → Server | Server → AI |
| Purpose | Perform actions | Get analysis/generation |
| Triggers | User requests | Your code/schedule |
| Use for | CRUD operations | Text generation/analysis |

### Decision Guide

**Use Tools when**:
- User initiates action
- Performing database operations
- Executing business logic
- Returning structured data

**Use Sampling when**:
- Server needs analysis
- Generating text content
- Detecting patterns
- Making recommendations
- Automated workflows

## How Sampling Works

### The Sampling Request Flow

```
1. Your Server Code
   ↓ (needs AI analysis)
2. Creates sampling request
   ↓ (sends to MCP client)
3. MCP Client (Claude, GPT, etc.)
   ↓ (processes and generates)
4. Returns AI-generated text
   ↓ (back to your server)
5. Your Server Uses Result
```

### Requirements

To use sampling, you need:

1. **Server Capability**: Declare `sampling: {}` in capabilities
2. **Client Support**: The MCP client must support sampling
3. **Request Handler**: Code to create sampling requests
4. **Message Format**: Properly formatted messages for the AI

:::warning
Not all MCP clients support sampling. Cursor's MCP implementation currently has limited sampling support. Test with your specific client.
:::

## Implementation Steps

### Step 1: Update Server Capabilities

In `src/index.ts`, add sampling to your capabilities:

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
        resources: {
          subscribe: false,
          listChanged: false
        },
        sampling: {}  // Add this line
      },
    },
    id,
  });
}
```

### Step 2: Create Sampling Utility

Create `src/utils/sampling.ts`:

```typescript
import { logger } from './logger.js';

export interface SamplingRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: {
      type: 'text';
      text: string;
    };
  }>;
  modelPreferences?: {
    hints?: Array<{
      name?: string;
    }>;
    costPriority?: number;
    speedPriority?: number;
    intelligencePriority?: number;
  };
  systemPrompt?: string;
  includeContext?: 'none' | 'thisServer' | 'allServers';
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  metadata?: Record<string, unknown>;
}

export interface SamplingResponse {
  role: 'assistant';
  content: {
    type: 'text';
    text: string;
  };
  model?: string;
  stopReason?: 'endTurn' | 'stopSequence' | 'maxTokens';
}

/**
 * Request sampling from the MCP client
 * Note: This is a placeholder - actual implementation depends on client support
 */
export async function requestSampling(
  request: SamplingRequest
): Promise<SamplingResponse> {
  logger.info('[Sampling] Requesting sampling from client');
  
  // In a real implementation, this would send a notification to the client
  // and wait for a response. The exact mechanism depends on the transport layer.
  
  // For HTTP/SSE, you might need to:
  // 1. Store the request in a queue
  // 2. Send a notification to connected clients
  // 3. Wait for the client to call back with results
  
  // This is a simplified example showing the structure
  throw new Error('Sampling not yet implemented - requires client support');
}

/**
 * Analyze contamination data using AI
 */
export async function analyzeContaminationPattern(
  contaminants: any[]
): Promise<string> {
  const request: SamplingRequest = {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze the following contamination data and identify patterns or concerns:

${JSON.stringify(contaminants, null, 2)}

Provide:
1. Key patterns observed
2. Severity assessment
3. Recommendations
4. Risk level (low/medium/high)`
        }
      }
    ],
    systemPrompt: 'You are a waste management compliance expert analyzing contamination data.',
    temperature: 0.3,  // Lower temperature for more focused analysis
    maxTokens: 1000
  };

  const response = await requestSampling(request);
  return response.content.text;
}

/**
 * Generate compliance report using AI
 */
export async function generateComplianceReport(
  facilityData: any
): Promise<string> {
  const request: SamplingRequest = {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Generate a professional compliance report for the following facility data:

${JSON.stringify(facilityData, null, 2)}

Format the report with:
- Executive Summary
- Compliance Score
- Key Findings
- Action Items
- Recommendations`
        }
      }
    ],
    systemPrompt: 'You are a compliance officer writing formal compliance reports.',
    temperature: 0.5,
    maxTokens: 2000
  };

  const response = await requestSampling(request);
  return response.content.text;
}

/**
 * Detect data anomalies using AI
 */
export async function detectAnomalies(
  data: any[],
  context: string
): Promise<string> {
  const request: SamplingRequest = {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze this ${context} data for anomalies or unusual patterns:

${JSON.stringify(data, null, 2)}

Identify:
1. Any outliers or unusual values
2. Data quality issues
3. Potential errors or inconsistencies
4. Notable trends

Be specific and reference actual data points.`
        }
      }
    ],
    systemPrompt: 'You are a data quality analyst identifying issues and patterns.',
    temperature: 0.4,
    maxTokens: 1500
  };

  const response = await requestSampling(request);
  return response.content.text;
}
```

### Step 3: Add Sampling to Tool Handlers

You can integrate sampling into your tool handlers. For example, add an analysis tool:

Create `src/tools/analysisTools.ts`:

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Facility, Contaminant, Inspection } from '../models/index.js';
import { analyzeContaminationPattern, generateComplianceReport } from '../utils/sampling.js';

const analyzeFacilitySchema = z.object({
  facilityId: z.string().describe('Facility ID to analyze'),
});

export const analysisTools = {
  analyze_facility_contamination: {
    description: 'Use AI to analyze contamination patterns for a facility',
    inputSchema: zodToJsonSchema(analyzeFacilitySchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof analyzeFacilitySchema>) => {
      try {
        const validatedArgs = analyzeFacilitySchema.parse(args);
        
        // Get contamination data
        const contaminants = await Contaminant.find({ 
          facilityId: validatedArgs.facilityId 
        }).sort({ detection_time: -1 }).limit(50).lean();

        if (contaminants.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No contamination data found for this facility.'
              }
            ]
          };
        }

        // Request AI analysis
        const analysis = await analyzeContaminationPattern(contaminants);

        return {
          content: [
            {
              type: 'text',
              text: `AI Analysis of Contamination Data:\n\n${analysis}`
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error analyzing contamination: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  },

  generate_facility_report: {
    description: 'Generate a comprehensive compliance report for a facility using AI',
    inputSchema: zodToJsonSchema(analyzeFacilitySchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof analyzeFacilitySchema>) => {
      try {
        const validatedArgs = analyzeFacilitySchema.parse(args);
        
        // Gather all facility data
        const [facility, contaminants, inspections] = await Promise.all([
          Facility.findById(validatedArgs.facilityId).lean(),
          Contaminant.find({ facilityId: validatedArgs.facilityId }).lean(),
          Inspection.find({ facility_id: validatedArgs.facilityId }).lean()
        ]);

        if (!facility) {
          return {
            content: [{ type: 'text', text: 'Facility not found' }],
            isError: true
          };
        }

        const facilityData = {
          facility,
          contaminants,
          inspections,
          metrics: {
            totalContaminants: contaminants.length,
            totalInspections: inspections.length,
            acceptanceRate: inspections.length > 0
              ? ((inspections.filter(i => i.is_delivery_accepted).length / inspections.length) * 100).toFixed(2)
              : '0'
          }
        };

        // Generate report using AI
        const report = await generateComplianceReport(facilityData);

        return {
          content: [
            {
              type: 'text',
              text: report
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error generating report: ${error.message}`
            }
          ],
          isError: true
        };
      }
    }
  }
};
```

### Step 4: Register Analysis Tools

In `src/tools/index.ts`, add the analysis tools:

```typescript
export { facilityTools } from './facilityTools.js';
export { contaminantTools } from './contaminantTools.js';
export { inspectionTools } from './inspectionTools.js';
export { shipmentTools } from './shipmentTools.js';
export { contractTools } from './contractTools.js';
export { analysisTools } from './analysisTools.js';  // Add this
```

Then in `src/index.ts`:

```typescript
import {
  facilityTools,
  contaminantTools,
  inspectionTools,
  shipmentTools,
  contractTools,
  analysisTools,  // Add this
} from './tools/index.js';

// Combine all tools
const allTools = {
  ...facilityTools,
  ...contaminantTools,
  ...inspectionTools,
  ...shipmentTools,
  ...contractTools,
  ...analysisTools,  // Add this
};
```

## Waste Management Examples

### Example 1: Automated Contamination Analysis

**Scenario**: When 10+ contamination detections occur in a day, automatically analyze for patterns

```typescript
import { Contaminant } from '../models/index.js';
import { analyzeContaminationPattern } from '../utils/sampling.js';

async function checkDailyContaminationPatterns() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysContaminants = await Contaminant.find({
    detection_time: { $gte: today }
  }).lean();

  if (todaysContaminants.length >= 10) {
    console.log('High contamination day detected, requesting AI analysis...');
    
    try {
      const analysis = await analyzeContaminationPattern(todaysContaminants);
      
      // Store or send the analysis
      console.log('AI Analysis:', analysis);
      
      // Could send alert email, store in database, etc.
    } catch (error) {
      console.error('Sampling not available:', error);
    }
  }
}

// Run daily at midnight
// schedule.scheduleJob('0 0 * * *', checkDailyContaminationPatterns);
```

### Example 2: Weekly Compliance Report

**Scenario**: Generate weekly compliance reports automatically

```typescript
import { Facility } from '../models/index.js';
import { generateComplianceReport } from '../utils/sampling.js';

async function generateWeeklyReports() {
  const facilities = await Facility.find().lean();

  for (const facility of facilities) {
    // Gather week's data
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [contaminants, inspections, shipments] = await Promise.all([
      Contaminant.find({ 
        facilityId: facility._id,
        detection_time: { $gte: weekAgo }
      }).lean(),
      Inspection.find({
        facility_id: facility._id,
        createdAt: { $gte: weekAgo }
      }).lean(),
      Shipment.find({
        facilityId: facility._id,
        entry_timestamp: { $gte: weekAgo }
      }).lean()
    ]);

    const weeklyData = {
      facility,
      period: 'Last 7 Days',
      contaminants,
      inspections,
      shipments
    };

    try {
      const report = await generateComplianceReport(weeklyData);
      
      // Email report to facility manager
      console.log(`Weekly report for ${facility.name}:`, report);
      
      // Could email, save to database, etc.
    } catch (error) {
      console.error(`Error generating report for ${facility.name}:`, error);
    }
  }
}

// Run weekly on Monday at 6 AM
// schedule.scheduleJob('0 6 * * 1', generateWeeklyReports);
```

### Example 3: Real-time Data Quality Check

**Scenario**: When new inspection data arrives, check for anomalies

```typescript
import { detectAnomalies } from '../utils/sampling.js';

async function validateInspectionData(inspection: any) {
  // Get recent similar inspections for context
  const recentInspections = await Inspection.find({
    facility_id: inspection.facility_id
  }).sort({ createdAt: -1 }).limit(20).lean();

  try {
    const anomalyReport = await detectAnomalies(
      [inspection, ...recentInspections],
      'inspection'
    );

    if (anomalyReport.includes('anomaly') || anomalyReport.includes('unusual')) {
      console.log('Potential data quality issue detected:', anomalyReport);
      
      // Flag for review
      await Inspection.updateOne(
        { _id: inspection._id },
        { $set: { flagged_for_review: true, review_reason: anomalyReport } }
      );
    }
  } catch (error) {
    console.error('Could not perform anomaly detection:', error);
  }
}
```

### Example 4: Smart Alert Prioritization

**Scenario**: Use AI to determine which contamination alerts are critical

```typescript
async function prioritizeContaminationAlerts(contaminants: any[]) {
  const request: SamplingRequest = {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Review these contamination detections and rank them by priority (1-5, 5 being critical):

${JSON.stringify(contaminants, null, 2)}

For each, provide:
- Priority score (1-5)
- Reasoning
- Recommended action
- Time sensitivity

Format as JSON array.`
        }
      }
    ],
    systemPrompt: 'You are a safety expert prioritizing contamination responses.',
    temperature: 0.2,
    maxTokens: 2000
  };

  const response = await requestSampling(request);
  return JSON.parse(response.content.text);
}
```

## Client Requirements

For sampling to work, the MCP client must:

1. **Support the Sampling Capability**: Check client documentation
2. **Handle Sampling Requests**: Process `sampling/createMessage` notifications
3. **Return Results**: Send back AI-generated responses
4. **Support the Transport**: Usually requires bidirectional communication (WebSocket/SSE)

### Client Support Status

| Client | Sampling Support | Notes |
|--------|------------------|-------|
| Claude Desktop | ✅ Yes | Full support |
| Cursor | ⚠️ Limited | Check current version |
| MCP Inspector | ✅ Yes | For testing |
| Custom Clients | Varies | Depends on implementation |

## Testing Sampling

### Testing with MCP Inspector

Since sampling is server-initiated, you need to:

1. **Create a test endpoint** that triggers sampling:

```typescript
// In src/index.ts
app.post('/test-sampling', async (req: Request, res: Response) => {
  try {
    const { facilityId } = req.body;
    
    const contaminants = await Contaminant.find({ facilityId }).limit(10).lean();
    const analysis = await analyzeContaminationPattern(contaminants);
    
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

2. **Call the endpoint** while MCP Inspector is connected:

```bash
curl -X POST http://localhost:3000/test-sampling \
  -H "Content-Type: application/json" \
  -d '{"facilityId": "507f1f77bcf86cd799439011"}'
```

### Manual Testing

1. Add sampling capability to server
2. Connect with a sampling-capable client
3. Trigger a workflow that requests sampling
4. Verify the client receives and processes the request
5. Check that the response is properly handled

## Best Practices

### 1. Use Appropriate Temperature

Different tasks need different temperature settings:

```typescript
// Factual analysis - low temperature (0.1-0.3)
temperature: 0.2

// Creative content - medium temperature (0.5-0.7)
temperature: 0.6

// Brainstorming - high temperature (0.8-1.0)
temperature: 0.9
```

### 2. Set Token Limits

Control costs and response length:

```typescript
maxTokens: 1000  // For concise summaries
maxTokens: 2000  // For detailed reports
maxTokens: 500   // For quick analyses
```

### 3. Provide Context in System Prompts

```typescript
systemPrompt: 'You are a waste management compliance expert with 20 years of experience. Analyze data objectively and cite specific data points.'
```

### 4. Structure Your Requests

Make it easy for the AI to respond:

✅ Good:
```
Analyze this data and provide:
1. Key patterns
2. Risk level
3. Recommendations
```

❌ Bad:
```
Analyze this data.
```

### 5. Handle Failures Gracefully

```typescript
try {
  const analysis = await requestSampling(request);
  return analysis;
} catch (error) {
  console.error('Sampling failed:', error);
  // Fallback to rule-based analysis
  return fallbackAnalysis(data);
}
```

### 6. Cache Results

Don't request the same analysis repeatedly:

```typescript
const cacheKey = `analysis:${facilityId}:${date}`;
const cached = await cache.get(cacheKey);

if (cached) {
  return cached;
}

const analysis = await requestSampling(request);
await cache.set(cacheKey, analysis, 3600); // Cache 1 hour
return analysis;
```

### 7. Monitor Costs

AI sampling can be expensive:

```typescript
// Track tokens used
let totalTokensUsed = 0;

async function trackSampling(request: SamplingRequest) {
  const response = await requestSampling(request);
  
  if (response.usage) {
    totalTokensUsed += response.usage.totalTokens;
    console.log(`Total tokens used today: ${totalTokensUsed}`);
  }
  
  return response;
}
```

## Common Pitfalls

### Pitfall 1: Overusing Sampling

❌ Bad:
```typescript
// Requesting AI analysis for every single record
for (const record of records) {
  await requestSampling({...});  // Expensive!
}
```

✅ Good:
```typescript
// Batch analysis or use sampling only when needed
if (records.length > threshold) {
  await requestSampling({ messages: [...] });
}
```

### Pitfall 2: Not Handling Unavailable Sampling

```typescript
// Always have a fallback
try {
  return await requestSampling(request);
} catch (error) {
  return ruleBasedAnalysis(data);
}
```

### Pitfall 3: Unclear Instructions

Make your requests specific and structured.

### Pitfall 4: Ignoring Token Limits

Without `maxTokens`, responses can be very long and expensive.

### Pitfall 5: Synchronous Blocking

```typescript
// Don't block the server waiting for sampling
// Use async/await and consider queuing for long tasks
```

## Alternative: Webhooks

If the client doesn't support sampling, consider using webhooks:

```typescript
// Instead of sampling, trigger external AI service
async function analyzeViaWebhook(data: any) {
  const response = await fetch('https://your-ai-service.com/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data,
      apiKey: process.env.AI_API_KEY
    })
  });
  
  return await response.json();
}
```

## Related Resources

- [MCP Prompts](./prompts.md) - Workflow templates
- [MCP Resources](./resources.md) - Readable data endpoints
- [Best Practices](../guides/best-practices.md) - General MCP guidelines
- [Architecture Overview](../architecture/overview.md) - System design

## Next Steps

1. **Check Client Support**: Verify your MCP client supports sampling
2. **Implement Capability**: Add `sampling: {}` to capabilities
3. **Create Utility Functions**: Build sampling helper functions
4. **Start Small**: Begin with one automated analysis
5. **Monitor and Optimize**: Track usage and refine prompts

:::warning
Sampling is a powerful but advanced feature. Start with prompts and resources first, then add sampling when you have specific automated analysis needs.
:::

:::tip
Even if full sampling isn't supported, the sampling utility functions can be adapted to call external AI APIs directly.
:::

