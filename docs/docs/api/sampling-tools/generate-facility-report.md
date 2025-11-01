# generate_intelligent_facility_report

Generate comprehensive facility analysis reports with AI-powered health scores, risk assessments, and recommendations.

## Overview

This tool analyzes a facility's operations by combining database queries with AI insights to provide:
- Overall health score (0-100)
- Top concerns and risk areas
- Compliance risk level assessment
- Actionable recommendations (optional)
- Comprehensive metrics and historical data

## Parameters

### `facilityId` (required)

- **Type:** `string`
- **Description:** The MongoDB ObjectId of the facility to analyze
- **Example:** `"6905db9211cc522275d5f013"`
- **Validation:** Must be a valid facility ID in the database

### `includeRecommendations` (optional)

- **Type:** `boolean`
- **Description:** Whether to include AI-generated recommendations
- **Default:** `false`
- **Example:** `true`

## Return Value

Returns a comprehensive facility report object:

```typescript
{
  reportId: string;              // Unique report identifier
  generatedAt: string;           // ISO 8601 timestamp
  facility: {
    id: string;
    name: string;
    location: string;
    shortCode: string;
  };
  metrics: {
    inspections: {
      total: number;
      accepted: number;
      acceptanceRate: string;   // Percentage
    };
    contamination: {
      total: number;
      highRisk: number;
      riskPercentage: string;   // Percentage
    };
    shipments: {
      total: number;
    };
  };
  aiAnalysis: {
    rawAnalysis: string;        // AI-generated analysis text
    timestamp: string;
  };
  rawData: {
    recentContaminants: Array<Contaminant>;
    recentInspections: Array<Inspection>;
    recentShipments: Array<Shipment>;
  };
}
```

## Usage Examples

### Using MCP Inspector

1. Open the Inspector:
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:3000/sse
   ```

2. Select tool: `generate_intelligent_facility_report`

3. Fill in parameters:
   ```json
   {
     "facilityId": "6905db9211cc522275d5f013",
     "includeRecommendations": true
   }
   ```

4. Execute and review the report

### Using cURL

#### With Recommendations

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "generate_intelligent_facility_report",
      "arguments": {
        "facilityId": "6905db9211cc522275d5f013",
        "includeRecommendations": true
      }
    },
    "id": 1
  }'
```

#### Without Recommendations

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "generate_intelligent_facility_report",
      "arguments": {
        "facilityId": "6905db9211cc522275d5f013"
      }
    },
    "id": 1
  }'
```

### Using JavaScript/TypeScript

```typescript
async function generateFacilityReport(facilityId: string) {
  const response = await fetch('http://localhost:3000/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'generate_intelligent_facility_report',
        arguments: {
          facilityId,
          includeRecommendations: true
        }
      },
      id: 1
    })
  });
  
  const result = await response.json();
  const report = JSON.parse(result.result.content[0].text);
  return report;
}

// Usage
const report = await generateFacilityReport('6905db9211cc522275d5f013');
console.log(`Health Score: ${report.aiAnalysis.rawAnalysis}`);
```

## Sample Response

```json
{
  "reportId": "RPT-1762005020502",
  "generatedAt": "2025-11-01T13:50:20.502Z",
  "facility": {
    "id": "6905db9211cc522275d5f013",
    "name": "Hannover",
    "location": "New York, NY",
    "shortCode": "HAN"
  },
  "metrics": {
    "inspections": {
      "total": 1,
      "accepted": 1,
      "acceptanceRate": "100.00%"
    },
    "contamination": {
      "total": 1,
      "highRisk": 1,
      "riskPercentage": "100.00%"
    },
    "shipments": {
      "total": 1
    }
  },
  "aiAnalysis": {
    "rawAnalysis": "Based on the facility data analysis:\n\n1. **Overall Health Score: 78/100**\n   - Good acceptance rate indicates proper waste handling\n   - Moderate contamination levels require attention\n   - Generally compliant operations with room for improvement\n\n2. **Top 3 Concerns:**\n   - Increasing contamination detection trends in recent shipments\n   - Some high-risk contaminants requiring immediate attention\n   - Occasional compliance issues with waste type specifications\n\n3. **Compliance Risk Level: MEDIUM**\n   - Current operations meet basic requirements\n   - Some areas need enhanced monitoring\n   - Proactive measures recommended to prevent escalation\n\n4. **3 Actionable Recommendations:**\n   - Implement enhanced pre-screening for high-risk sources\n   - Increase staff training on contamination identification\n   - Establish monthly compliance review meetings",
    "timestamp": "2025-11-01T13:50:20.502Z"
  },
  "rawData": {
    "recentContaminants": [
      {
        "_id": "6905db9211cc522275d5f01a",
        "wasteItemDetected": "Hazardous Battery",
        "material": "Lithium-Ion",
        "explosive_level": "high",
        "hcl_level": "low",
        "so2_level": "medium",
        "estimated_size": 2.5,
        "detection_time": "2025-11-01T09:15:00.000Z"
      }
    ],
    "recentInspections": [...],
    "recentShipments": [...]
  }
}
```

## AI Analysis Structure

The `aiAnalysis.rawAnalysis` field contains structured text with:

### Health Score (0-100)
- **90-100**: Excellent - Minimal concerns
- **75-89**: Good - Some areas for improvement
- **60-74**: Fair - Moderate concerns present
- **40-59**: Poor - Significant issues requiring attention
- **0-39**: Critical - Immediate action required

### Top 3 Concerns
Bullet-pointed list of the most pressing issues identified through AI analysis of facility data.

### Compliance Risk Level
- **LOW**: Operations well within compliance standards
- **MEDIUM**: Some areas need monitoring or improvement
- **HIGH**: Significant compliance risks present

### Recommendations (if requested)
3-5 specific, actionable steps to improve facility operations and compliance.

## Use Cases

### 1. Monthly Performance Reviews

Generate reports at regular intervals to track facility performance:

```bash
# Run monthly report
./generate-monthly-reports.sh
```

### 2. Compliance Audits

Prepare comprehensive facility assessments before regulatory audits:

```typescript
const report = await generateFacilityReport(facilityId);
if (report.aiAnalysis.rawAnalysis.includes('HIGH')) {
  await scheduleComplianceReview(facilityId);
}
```

### 3. Executive Summaries

Create high-level overviews for management:

```typescript
const facilities = await listFacilities();
const reports = await Promise.all(
  facilities.map(f => generateFacilityReport(f.id))
);

// Compare health scores
reports.sort((a, b) => 
  extractHealthScore(b.aiAnalysis) - extractHealthScore(a.aiAnalysis)
);
```

### 4. Identifying Problem Areas

Proactively identify facilities needing attention:

```typescript
const report = await generateFacilityReport(facilityId);
const metrics = report.metrics;

if (metrics.contamination.highRisk > 5) {
  await notifyManagement({
    facility: facilityId,
    alert: 'High contamination levels detected',
    score: extractHealthScore(report.aiAnalysis)
  });
}
```

## Error Handling

### Facility Not Found

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"error\":\"Facility not found\"}"
      }
    ],
    "isError": true
  },
  "id": 1
}
```

### Invalid Facility ID

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"error\":\"Error generating report: ...\"}"
      }
    ],
    "isError": true
  },
  "id": 1
}
```

### AI Analysis Unavailable

If sampling fails, the tool still returns useful data with a fallback message:

```json
{
  "aiAnalysis": {
    "note": "Sampling not available - AI analysis skipped"
  },
  "metrics": { ... }
}
```

## Performance

- **Average Response Time:** ~500ms
- **Database Queries:** 4 (facility, inspections, contaminants, shipments)
- **AI Requests:** 1 sampling request
- **Data Fetched:** Up to 60 recent records (20 inspections, 50 contaminants, 30 shipments)

## Best Practices

### 1. Cache Reports for Historical Data

```typescript
// Cache reports that don't change
const cacheKey = `report:${facilityId}:${month}`;
let report = await cache.get(cacheKey);

if (!report) {
  report = await generateFacilityReport(facilityId);
  await cache.set(cacheKey, report, '30d');
}
```

### 2. Request Recommendations Only When Needed

Recommendations add processing time. Only request when needed:

```typescript
// For detailed reviews
const detailedReport = await generateFacilityReport(id, true);

// For quick checks
const quickReport = await generateFacilityReport(id, false);
```

### 3. Process Reports Asynchronously

For multiple facilities, use batch processing:

```typescript
const facilityIds = await getAllFacilityIds();

// Process in batches of 5
for (const batch of chunk(facilityIds, 5)) {
  await Promise.all(
    batch.map(id => generateFacilityReport(id))
  );
}
```

### 4. Monitor for Trends

Track health scores over time:

```typescript
const history = await getReportHistory(facilityId);
const trend = calculateTrend(history.map(r => r.healthScore));

if (trend === 'declining') {
  await alertManagement(facilityId);
}
```

## Related Tools

- **[analyze_shipment_risk](./analyze-shipment-risk.md)** - Detailed shipment risk assessment
- **[suggest_inspection_questions](./suggest-inspection-questions.md)** - Generate inspection checklists
- **[list_facilities](../facilities/list-facilities.md)** - Get all facility IDs
- **[get_facility](../facilities/get-facility.md)** - Get facility details

## See Also

- [Sampling Guide](../../guides/sampling-guide.md) - How sampling works
- [AI Analysis Examples](../../examples/ai-analysis.md) - Complete workflows
- [Best Practices](../../guides/best-practices.md) - General recommendations

---

**Need help?** Check the [Troubleshooting Guide](../../troubleshooting/common-issues.md) or review server logs for detailed information.

