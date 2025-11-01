# AI-Powered Analysis Examples

Complete workflows using the three AI-powered sampling tools for real-world waste management scenarios.

## Overview

This guide demonstrates end-to-end workflows that combine:
- Database queries
- AI-powered analysis
- Decision-making logic
- Real-world use cases

## Prerequisites

- Server running with sampling enabled
- Test data in MongoDB
- MCP Inspector or API client

## Example 1: Comprehensive Facility Audit

**Scenario:** Conduct a full facility audit combining multiple data sources and AI insights.

### Step 1: Generate Facility Report

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

**Response Analysis:**
```json
{
  "reportId": "RPT-1762005020502",
  "facility": {
    "name": "Hannover",
    "location": "New York, NY"
  },
  "metrics": {
    "inspections": {
      "acceptanceRate": "100.00%"
    },
    "contamination": {
      "total": 1,
      "highRisk": 1
    }
  },
  "aiAnalysis": {
    "rawAnalysis": "Health Score: 78/100\nRisk Level: MEDIUM"
  }
}
```

### Step 2: Identify High-Risk Shipments

```typescript
// Get recent shipments for this facility
const shipments = await callTool('list_shipments', {
  facilityId: '6905db9211cc522275d5f013'
});

// Analyze risk for each
const riskAssessments = await Promise.all(
  shipments.map(s => callTool('analyze_shipment_risk', {
    shipmentId: s._id
  }))
);

// Sort by risk score
const highRisk = riskAssessments
  .filter(a => a.aiRiskScore.score > 60)
  .sort((a, b) => b.aiRiskScore.score - a.aiRiskScore.score);

console.log(`Found ${highRisk.length} high-risk shipments`);
```

### Step 3: Generate Inspection Checklist

```bash
curl -X POST http://localhost:3000/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "suggest_inspection_questions",
      "arguments": {
        "facilityId": "6905db9211cc522275d5f013"
      }
    },
    "id": 3
  }'
```

**Result:**
```json
{
  "focusArea": "Contamination levels",
  "inspectionQuestions": [
    "Are contamination detection systems functioning properly?",
    "What protocols are in place for high-risk events?",
    ...
  ]
}
```

### Step 4: Create Audit Report

```typescript
async function conductFacilityAudit(facilityId: string) {
  // Gather all data
  const [
    facilityReport,
    shipments,
    checklist
  ] = await Promise.all([
    callTool('generate_intelligent_facility_report', {
      facilityId,
      includeRecommendations: true
    }),
    callTool('list_shipments', { facilityId }),
    callTool('suggest_inspection_questions', { facilityId })
  ]);

  // Analyze shipment risks
  const riskAssessments = await Promise.all(
    shipments.map(s => 
      callTool('analyze_shipment_risk', { shipmentId: s._id })
    )
  );

  const avgRiskScore = riskAssessments.reduce((sum, a) => 
    sum + a.aiRiskScore.score, 0
  ) / riskAssessments.length;

  // Compile comprehensive audit
  return {
    facility: facilityReport.facility,
    healthScore: extractHealthScore(facilityReport),
    averageShipmentRisk: avgRiskScore,
    totalShipments: shipments.length,
    highRiskShipments: riskAssessments.filter(a => 
      a.aiRiskScore.score > 60
    ).length,
    recommendations: extractRecommendations(facilityReport),
    inspectionChecklist: checklist.inspectionQuestions,
    focusArea: checklist.focusArea,
    auditDate: new Date().toISOString()
  };
}

// Execute audit
const audit = await conductFacilityAudit('6905db9211cc522275d5f013');
console.log(JSON.stringify(audit, null, 2));
```

**Complete Audit Output:**
```json
{
  "facility": {
    "name": "Hannover",
    "location": "New York, NY"
  },
  "healthScore": 78,
  "averageShipmentRisk": 65,
  "totalShipments": 1,
  "highRiskShipments": 1,
  "recommendations": [
    "Implement enhanced pre-screening for high-risk sources",
    "Increase staff training on contamination identification",
    "Establish monthly compliance review meetings"
  ],
  "inspectionChecklist": [
    "Are contamination detection systems functioning properly?",
    ...
  ],
  "focusArea": "Contamination levels",
  "auditDate": "2025-11-01T14:00:00.000Z"
}
```

## Example 2: Shipment Processing Pipeline

**Scenario:** Automated risk-based routing for incoming shipments.

### Implementation

```typescript
async function processIncomingShipment(shipmentId: string) {
  console.log(`Processing shipment: ${shipmentId}`);

  // Step 1: Get shipment details
  const shipment = await callTool('get_shipment', { id: shipmentId });
  
  // Step 2: Analyze risk
  const assessment = await callTool('analyze_shipment_risk', { shipmentId });
  
  const riskScore = assessment.aiRiskScore.score;
  console.log(`Risk Score: ${riskScore}/100`);

  // Step 3: Route based on risk
  if (riskScore > 80) {
    console.log('⛔ CRITICAL RISK - Rejecting shipment');
    await callTool('update_shipment', {
      id: shipmentId,
      status: 'rejected'
    });
    await sendAlert({
      type: 'CRITICAL_RISK',
      shipment,
      assessment
    });
  } else if (riskScore > 60) {
    console.log('⚠️ HIGH RISK - Routing to detailed inspection');
    await scheduleDetailedInspection(shipmentId);
    await notifyInspector({
      priority: 'HIGH',
      shipment,
      riskFactors: assessment.riskFactors
    });
  } else if (riskScore > 40) {
    console.log('📋 MODERATE RISK - Standard inspection');
    await scheduleStandardInspection(shipmentId);
  } else {
    console.log('✅ LOW RISK - Fast track');
    await routeToFastTrack(shipmentId);
  }

  return {
    shipmentId,
    riskScore,
    action: determineAction(riskScore),
    assessment
  };
}

// Process multiple shipments
const pendingShipments = await callTool('list_shipments', {
  status: 'pending'
});

for (const shipment of pendingShipments) {
  await processIncomingShipment(shipment._id);
}
```

## Example 3: Daily Facility Monitoring

**Scenario:** Automated daily monitoring with alerts for concerning patterns.

### Implementation

```typescript
async function dailyFacilityMonitoring() {
  console.log('Starting daily monitoring...');
  
  // Get all facilities
  const facilities = await callTool('list_facilities', {});
  
  const alerts = [];

  for (const facility of facilities) {
    // Generate report
    const report = await callTool('generate_intelligent_facility_report', {
      facilityId: facility._id,
      includeRecommendations: false
    });

    const healthScore = extractHealthScore(report);
    
    // Check thresholds
    if (healthScore < 60) {
      alerts.push({
        facility: facility.name,
        severity: 'HIGH',
        reason: `Health score below 60: ${healthScore}`,
        metrics: report.metrics
      });
    }

    if (report.metrics.contamination.highRisk > 5) {
      alerts.push({
        facility: facility.name,
        severity: 'MEDIUM',
        reason: `${report.metrics.contamination.highRisk} high-risk contaminants`,
        metrics: report.metrics
      });
    }

    if (parseFloat(report.metrics.inspections.acceptanceRate) < 70) {
      alerts.push({
        facility: facility.name,
        severity: 'MEDIUM',
        reason: `Low acceptance rate: ${report.metrics.inspections.acceptanceRate}`,
        metrics: report.metrics
      });
    }
  }

  // Send summary email
  if (alerts.length > 0) {
    await sendDailyReport({
      date: new Date().toISOString(),
      facilitiesMonitored: facilities.length,
      alertsGenerated: alerts.length,
      alerts
    });
  }

  return {
    date: new Date().toISOString(),
    facilitiesMonitored: facilities.length,
    alerts
  };
}

// Run daily at 6 AM
schedule.scheduleJob('0 6 * * *', dailyFacilityMonitoring);
```

## Example 4: Inspector Assignment Optimization

**Scenario:** Assign inspectors based on facility needs and inspector expertise.

### Implementation

```typescript
async function assignInspectors() {
  // Get all facilities
  const facilities = await callTool('list_facilities', {});
  
  // Generate checklists for each
  const checklists = await Promise.all(
    facilities.map(f => callTool('suggest_inspection_questions', {
      facilityId: f._id
    }))
  );

  // Group by focus area
  const byFocusArea = {
    'Contamination levels': [],
    'Acceptance rates': [],
    'Processing times': [],
    'Waste type compliance': []
  };

  checklists.forEach((checklist, idx) => {
    byFocusArea[checklist.focusArea].push({
      facility: facilities[idx],
      checklist
    });
  });

  // Assign inspectors based on expertise
  const assignments = [];

  for (const [focusArea, items] of Object.entries(byFocusArea)) {
    const inspector = await getInspectorByExpertise(focusArea);
    
    for (const item of items) {
      assignments.push({
        inspector: inspector.name,
        facility: item.facility.name,
        focusArea,
        checklist: item.checklist.inspectionQuestions,
        scheduledDate: getNextAvailableSlot(inspector)
      });
    }
  }

  return assignments;
}

// Execute and notify
const assignments = await assignInspectors();
for (const assignment of assignments) {
  await notifyInspector(assignment);
}
```

## Example 5: Source Performance Tracking

**Scenario:** Evaluate and rank waste sources based on shipment quality.

### Implementation

```typescript
async function evaluateWasteSources() {
  // Get all shipments
  const allShipments = await callTool('list_shipments', {});
  
  // Group by source
  const bySource = groupBy(allShipments, 'source');
  
  const sourceEvaluations = [];

  for (const [source, shipments] of Object.entries(bySource)) {
    // Analyze each shipment from this source
    const assessments = await Promise.all(
      shipments.map(s => callTool('analyze_shipment_risk', {
        shipmentId: s._id
      }))
    );

    const avgRisk = assessments.reduce((sum, a) => 
      sum + a.aiRiskScore.score, 0
    ) / assessments.length;

    const highRiskCount = assessments.filter(a => 
      a.aiRiskScore.score > 60
    ).length;

    const totalContaminants = assessments.reduce((sum, a) => 
      sum + a.detailedContaminants.length, 0
    );

    // Calculate grade
    let grade;
    if (avgRisk < 30) grade = 'A';
    else if (avgRisk < 50) grade = 'B';
    else if (avgRisk < 70) grade = 'C';
    else if (avgRisk < 85) grade = 'D';
    else grade = 'F';

    sourceEvaluations.push({
      source,
      totalShipments: shipments.length,
      averageRiskScore: Math.round(avgRisk),
      highRiskShipments: highRiskCount,
      totalContaminants,
      grade,
      recommendation: getRecommendation(grade, avgRisk)
    });
  }

  // Sort by risk (worst first)
  sourceEvaluations.sort((a, b) => 
    b.averageRiskScore - a.averageRiskScore
  );

  return sourceEvaluations;
}

function getRecommendation(grade: string, avgRisk: number) {
  if (grade === 'F') return 'Consider terminating relationship';
  if (grade === 'D') return 'Require corrective action plan';
  if (grade === 'C') return 'Enhanced monitoring required';
  if (grade === 'B') return 'Standard monitoring';
  return 'Preferred source';
}

// Generate monthly report
const evaluation = await evaluateWasteSources();
console.log('Source Performance Report');
console.table(evaluation);
```

**Sample Output:**
```
┌─────────┬────────────────────────┬──────────────────┬──────────────────────┬─────────────────┬───────────────────────┬───────┬──────────────────────────────────────┐
│ (index) │         source         │ totalShipments   │ averageRiskScore     │ highRiskShipments│ totalContaminants     │ grade │         recommendation               │
├─────────┼────────────────────────┼──────────────────┼──────────────────────┼─────────────────┼───────────────────────┼───────┼──────────────────────────────────────┤
│    0    │ 'Industrial District A'│        1         │         65           │        1         │          1            │  'C'  │ 'Enhanced monitoring required'       │
└─────────┴────────────────────────┴──────────────────┴──────────────────────┴─────────────────┴───────────────────────┴───────┴──────────────────────────────────────┘
```

## Best Practices from Examples

### 1. Batch Processing

When analyzing multiple items, use `Promise.all()`:

```typescript
// Good - Parallel processing
const assessments = await Promise.all(
  shipments.map(s => analyzeShipmentRisk(s.id))
);

// Bad - Sequential (slow)
const assessments = [];
for (const shipment of shipments) {
  assessments.push(await analyzeShipmentRisk(shipment.id));
}
```

### 2. Error Handling

Always handle potential failures:

```typescript
try {
  const report = await generateFacilityReport(facilityId);
  // Use report
} catch (error) {
  console.error('Failed to generate report:', error);
  // Use fallback or notify
}
```

### 3. Caching Results

Cache expensive operations:

```typescript
const cacheKey = `report:${facilityId}:${today}`;
let report = await cache.get(cacheKey);

if (!report) {
  report = await generateFacilityReport(facilityId);
  await cache.set(cacheKey, report, '24h');
}
```

### 4. Combine Tools

Use multiple tools together for comprehensive analysis:

```typescript
const [report, checklist, shipmentRisks] = await Promise.all([
  generateFacilityReport(facilityId),
  suggestInspectionQuestions(facilityId),
  analyzeAllShipments(facilityId)
]);
```

## Helper Functions

Useful helper functions for the examples above:

```typescript
function extractHealthScore(report: any): number {
  const match = report.aiAnalysis.rawAnalysis.match(/Health Score: (\d+)/);
  return match ? parseInt(match[1]) : 50;
}

function extractRecommendations(report: any): string[] {
  const analysis = report.aiAnalysis.rawAnalysis;
  const recSection = analysis.split('Recommendations:')[1];
  if (!recSection) return [];
  
  return recSection
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(2));
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    (result[group] = result[group] || []).push(item);
    return result;
  }, {} as Record<string, T[]>);
}

async function callTool(name: string, args: any): Promise<any> {
  const response = await fetch('http://localhost:3000/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name, arguments: args },
      id: Date.now()
    })
  });
  
  const result = await response.json();
  return JSON.parse(result.result.content[0].text);
}
```

## See Also

- [AI-Powered Tools API](../api/sampling-tools/overview.md) - Complete API reference
- [Sampling Guide](../guides/sampling-guide.md) - Implementation details
- [Best Practices](../guides/best-practices.md) - General recommendations

---

**Ready to build your own workflows?** Start with the [Quick Start Guide](../getting-started/quick-start.md) and [API Documentation](../api/sampling-tools/overview.md).

