# analyze_shipment_risk

Perform AI-powered risk assessment for shipments based on contamination history and patterns.

## Overview

This tool analyzes a specific shipment's risk level by:
- Examining current shipment contaminants
- Reviewing source history and patterns
- Generating AI risk score (0-100)
- Identifying specific risk factors
- Providing recommended actions

## Parameters

### `shipmentId` (required)

- **Type:** `string`
- **Description:** The MongoDB ObjectId of the shipment to analyze
- **Example:** `"6905db9211cc522275d5f018"`
- **Validation:** Must be a valid shipment ID in the database

## Return Value

Returns a risk assessment object:

```typescript
{
  shipmentId: string;
  assessedAt: string;              // ISO 8601 timestamp
  shipment: {
    source: string;
    licensePlate: string;
    facility: string;
    duration: string;              // Processing time
  };
  riskIndicators: {
    currentContaminants: number;
    highRiskContaminants: number;
    sourceHistoryContaminants: number;
    sourceHistoryShipments: number;
  };
  aiRiskScore: {
    score: number;                 // 0-100 risk score
    reasoning: string;             // AI explanation
  };
  riskFactors: string[];           // List of risk factors
  recommendedActions: string[];    // Suggested next steps
  detailedContaminants: Array<Contaminant>;
}
```

## Usage Examples

### Using MCP Inspector

1. Open the Inspector:
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:3000/sse
   ```

2. Select tool: `analyze_shipment_risk`

3. Provide shipment ID:
   ```json
   {
     "shipmentId": "6905db9211cc522275d5f018"
   }
   ```

4. Execute and review risk assessment

### Using cURL

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "analyze_shipment_risk",
      "arguments": {
        "shipmentId": "6905db9211cc522275d5f018"
      }
    },
    "id": 1
  }'
```

### Using JavaScript/TypeScript

```typescript
async function analyzeShipmentRisk(shipmentId: string) {
  const response = await fetch('http://localhost:3000/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'analyze_shipment_risk',
        arguments: { shipmentId }
      },
      id: 1
    })
  });
  
  const result = await response.json();
  const assessment = JSON.parse(result.result.content[0].text);
  return assessment;
}

// Usage
const assessment = await analyzeShipmentRisk('6905db9211cc522275d5f018');
console.log(`Risk Score: ${assessment.aiRiskScore.score}/100`);

if (assessment.aiRiskScore.score > 70) {
  console.log('HIGH RISK - Immediate inspection required');
}
```

## Sample Response

```json
{
  "shipmentId": "6905db9211cc522275d5f018",
  "assessedAt": "2025-11-01T13:50:29.278Z",
  "shipment": {
    "source": "Industrial District A",
    "licensePlate": "ABC-123",
    "facility": "Hannover",
    "duration": "120 minutes"
  },
  "riskIndicators": {
    "currentContaminants": 1,
    "highRiskContaminants": 1,
    "sourceHistoryContaminants": 0,
    "sourceHistoryShipments": 0
  },
  "aiRiskScore": {
    "score": 65,
    "reasoning": "Moderate risk level due to detected contaminants and source history. The presence of high-risk materials and limited historical data from this source warrant enhanced scrutiny. Recommended actions include thorough inspection and source verification."
  },
  "riskFactors": [
    "Contaminants detected in current shipment",
    "High-risk contaminants present",
    "Limited history from this source"
  ],
  "recommendedActions": [
    "Immediate inspection required",
    "Enhanced monitoring for future shipments from this source",
    "Document all findings in compliance report"
  ],
  "detailedContaminants": [
    {
      "_id": "6905db9211cc522275d5f01a",
      "wasteItemDetected": "Hazardous Battery",
      "material": "Lithium-Ion",
      "facilityId": "6905db9211cc522275d5f013",
      "detection_time": "2025-11-01T09:15:00.000Z",
      "explosive_level": "high",
      "hcl_level": "low",
      "so2_level": "medium",
      "estimated_size": 2.5,
      "shipment_id": "6905db9211cc522275d5f018"
    }
  ]
}
```

## Risk Score Interpretation

### Score Ranges

- **0-20**: **Minimal Risk** - Standard processing procedures apply
- **21-40**: **Low Risk** - Monitor but no special actions required
- **41-60**: **Moderate Risk** - Enhanced monitoring recommended
- **61-80**: **High Risk** - Immediate inspection required
- **81-100**: **Critical Risk** - Stop processing, initiate emergency protocols

### Factors Affecting Score

The AI risk score considers:
1. **Current Contaminants**: Number and severity
2. **Contamination History**: Source's past record
3. **Explosive/Hazardous Materials**: Presence of dangerous substances
4. **Source Reliability**: Track record of the waste source
5. **Pattern Recognition**: Unusual patterns or anomalies

## Use Cases

### 1. Real-Time Shipment Evaluation

Assess shipments as they arrive:

```typescript
async function processArrival(shipmentId: string) {
  const assessment = await analyzeShipmentRisk(shipmentId);
  
  if (assessment.aiRiskScore.score > 60) {
    await prioritizeInspection(shipmentId);
    await notifyInspector({
      shipment: shipmentId,
      riskLevel: 'HIGH',
      factors: assessment.riskFactors
    });
  }
  
  return assessment;
}
```

### 2. Risk-Based Inspection Prioritization

Sort incoming shipments by risk:

```typescript
const shipments = await listShipments({ status: 'pending' });
const assessments = await Promise.all(
  shipments.map(s => analyzeShipmentRisk(s.id))
);

// Sort by risk score (highest first)
assessments.sort((a, b) => 
  b.aiRiskScore.score - a.aiRiskScore.score
);

// Inspect high-risk shipments first
for (const assessment of assessments) {
  if (assessment.aiRiskScore.score > 50) {
    await scheduleInspection(assessment.shipmentId);
  }
}
```

### 3. Source Reliability Assessment

Track source performance over time:

```typescript
async function evaluateSource(sourceName: string) {
  const shipments = await listShipments({ source: sourceName });
  const assessments = await Promise.all(
    shipments.map(s => analyzeShipmentRisk(s.id))
  );
  
  const avgRisk = assessments.reduce((sum, a) => 
    sum + a.aiRiskScore.score, 0
  ) / assessments.length;
  
  if (avgRisk > 70) {
    await blacklistSource(sourceName);
  } else if (avgRisk > 50) {
    await flagSourceForReview(sourceName);
  }
}
```

### 4. Incident Investigation

Analyze shipments involved in incidents:

```typescript
async function investigateIncident(incidentId: string) {
  const incident = await getIncident(incidentId);
  const shipmentId = incident.shipmentId;
  
  const assessment = await analyzeShipmentRisk(shipmentId);
  
  return {
    incident,
    riskAssessment: assessment,
    preventionMeasures: assessment.recommendedActions,
    sourceHistory: {
      totalShipments: assessment.riskIndicators.sourceHistoryShipments,
      totalContaminants: assessment.riskIndicators.sourceHistoryContaminants
    }
  };
}
```

## Risk Factors Explained

Common risk factors returned by the tool:

### "Contaminants detected in current shipment"
The shipment contains one or more contaminants, increasing processing complexity and risk.

### "High-risk contaminants present"
Dangerous materials (high explosive, HCl, or SO2 levels) detected.

### "Source has contamination history"
This source has sent contaminated shipments in the past (> 5 historical contaminants).

### "Limited history from this source"
Fewer than 3 previous shipments from this source, making risk assessment harder.

## Recommended Actions

Common recommended actions:

### "Immediate inspection required"
High-risk contaminants detected - stop processing and conduct thorough inspection.

### "Enhanced monitoring for future shipments"
Flag this source for closer scrutiny on future deliveries.

### "Consider source evaluation"
Source has poor track record - may need relationship review or contract modification.

### "Document all findings in compliance report"
Standard practice for maintaining audit trail.

## Error Handling

### Shipment Not Found

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"error\":\"Shipment not found\"}"
      }
    ],
    "isError": true
  },
  "id": 1
}
```

### AI Risk Scoring Unavailable

If sampling fails, fallback score is calculated:

```json
{
  "aiRiskScore": {
    "note": "Sampling not available - AI risk scoring skipped",
    "fallbackScore": 45,
    "fallbackReasoning": "Calculated based on contamination count and severity levels"
  }
}
```

The fallback formula:
```
score = min(100, 
  (contaminants × 10) + 
  (highRiskContaminants × 25) + 
  (sourceHistoryContaminants × 2)
)
```

## Performance

- **Average Response Time:** ~300ms
- **Database Queries:** 3 (shipment, facility, contaminants + source history)
- **AI Requests:** 1 risk scoring request
- **Data Analyzed:** Current shipment + up to 10 historical shipments from same source

## Best Practices

### 1. Use for Risk-Based Decision Making

```typescript
const assessment = await analyzeShipmentRisk(shipmentId);
const score = assessment.aiRiskScore.score;

// Risk-based routing
if (score > 80) {
  await rejectShipment(shipmentId);
} else if (score > 60) {
  await routeToDetailedInspection(shipmentId);
} else if (score > 40) {
  await routeToStandardInspection(shipmentId);
} else {
  await routeToFastTrack(shipmentId);
}
```

### 2. Combine with Other Tools

```typescript
// Get comprehensive view
const [riskAssessment, facilityReport] = await Promise.all([
  analyzeShipmentRisk(shipmentId),
  generateFacilityReport(facilityId)
]);

// Cross-reference insights
if (riskAssessment.aiRiskScore.score > 70 && 
    facilityReport.metrics.contamination.highRisk > 5) {
  await escalateToManagement({
    message: 'High-risk shipment at high-contamination facility',
    shipment: shipmentId,
    facility: facilityId
  });
}
```

### 3. Log and Track Risk Assessments

```typescript
const assessment = await analyzeShipmentRisk(shipmentId);

await logRiskAssessment({
  shipmentId,
  timestamp: assessment.assessedAt,
  score: assessment.aiRiskScore.score,
  factors: assessment.riskFactors,
  action: determineAction(assessment.aiRiskScore.score)
});
```

### 4. Create Alerts for High-Risk Patterns

```typescript
async function checkForHighRiskPatterns() {
  const recentShipments = await listShipments({ 
    since: Date.now() - 24 * 60 * 60 * 1000 // Last 24h
  });
  
  const assessments = await Promise.all(
    recentShipments.map(s => analyzeShipmentRisk(s.id))
  );
  
  const highRiskCount = assessments.filter(a => 
    a.aiRiskScore.score > 70
  ).length;
  
  if (highRiskCount > 3) {
    await sendAlert({
      type: 'HIGH_RISK_PATTERN',
      message: `${highRiskCount} high-risk shipments in last 24 hours`,
      severity: 'WARNING'
    });
  }
}
```

## Related Tools

- **[generate_intelligent_facility_report](./generate-facility-report.md)** - Facility health assessment
- **[suggest_inspection_questions](./suggest-inspection-questions.md)** - Generate inspection checklists
- **[get_shipment](../shipments/get-shipment.md)** - Get shipment details
- **[list_contaminants](../contaminants/list-contaminants.md)** - List contaminants

## See Also

- [Sampling Guide](../../guides/sampling-guide.md) - How AI risk scoring works
- [AI Analysis Examples](../../examples/ai-analysis.md) - Complete workflows
- [Error Handling](../../guides/error-handling.md) - Handling failures

---

**Need help?** Check the [Troubleshooting Guide](../../troubleshooting/common-issues.md) or review server logs for detailed information.

