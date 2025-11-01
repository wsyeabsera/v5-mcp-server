# suggest_inspection_questions

Generate customized inspection checklists based on facility history using AI elicitation and analysis.

## Overview

This tool creates tailored inspection questions by:
- Analyzing facility metrics and history
- Using AI elicitation to select focus area
- Generating 5-7 targeted questions
- Providing context-specific recommendations
- Highlighting areas needing extra attention

## Parameters

### `facilityId` (required)

- **Type:** `string`
- **Description:** The MongoDB ObjectId of the facility to generate questions for
- **Example:** `"6905db9211cc522275d5f013"`
- **Validation:** Must be a valid facility ID in the database

## Return Value

Returns an inspection checklist object:

```typescript
{
  facilityId: string;
  facilityName: string;
  generatedAt: string;                // ISO 8601 timestamp
  focusArea: string;                  // Selected area of concern
  selectionMethod: string;            // 'AI-assisted' or 'metric-based'
  facilityMetrics: {
    recentContaminants: number;
    acceptanceRate: string;           // Percentage
    avgProcessingTime: string;        // Minutes
    complianceIssues: number;
  };
  inspectionQuestions: string[];      // 5-7 targeted questions
  additionalNotes: string[];          // Context-specific alerts
}
```

## Usage Examples

### Using MCP Inspector

1. Open the Inspector:
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:3000/sse
   ```

2. Select tool: `suggest_inspection_questions`

3. Provide facility ID:
   ```json
   {
     "facilityId": "6905db9211cc522275d5f013"
   }
   ```

4. Execute and review inspection checklist

### Using cURL

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
    "id": 1
  }'
```

### Using JavaScript/TypeScript

```typescript
async function getInspectionQuestions(facilityId: string) {
  const response = await fetch('http://localhost:3000/sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'suggest_inspection_questions',
        arguments: { facilityId }
      },
      id: 1
    })
  });
  
  const result = await response.json();
  const checklist = JSON.parse(result.result.content[0].text);
  return checklist;
}

// Usage
const checklist = await getInspectionQuestions('6905db9211cc522275d5f013');
console.log(`Focus Area: ${checklist.focusArea}`);
console.log('Questions:');
checklist.inspectionQuestions.forEach((q, i) => {
  console.log(`${i + 1}. ${q}`);
});
```

## Sample Response

```json
{
  "facilityId": "6905db9211cc522275d5f013",
  "facilityName": "Hannover",
  "generatedAt": "2025-11-01T13:50:37.896Z",
  "focusArea": "Contamination levels",
  "selectionMethod": "AI-assisted",
  "facilityMetrics": {
    "recentContaminants": 1,
    "acceptanceRate": "100.0%",
    "avgProcessingTime": "120 minutes",
    "complianceIssues": 0
  },
  "inspectionQuestions": [
    "Are contamination detection systems functioning properly and calibrated?",
    "What protocols are currently in place for handling high-risk contamination events?",
    "Review recent contamination logs - are there emerging patterns by source or waste type?",
    "Verify that staff members are trained on the latest contamination identification procedures",
    "Check segregation procedures for contaminated waste streams",
    "Assess the effectiveness of supplier communication regarding contamination prevention",
    "Review documentation procedures for contamination incidents"
  ],
  "additionalNotes": []
}
```

## Focus Areas

The tool can select from four focus areas based on facility data:

### Contamination Levels
Selected when:
- High number of recent contaminants (> 10)
- Pattern of contamination detections
- High-risk materials frequently detected

**Sample Questions:**
- Contamination detection system status
- High-risk event protocols
- Pattern analysis in logs
- Staff training verification
- Segregation procedures

### Acceptance Rates
Selected when:
- Low acceptance rate (< 70%)
- Increasing rejection trends
- Supplier compliance issues

**Sample Questions:**
- Review rejection reasons
- Supplier communication effectiveness
- Acceptance criteria clarity
- Pre-arrival notification system
- Criteria adjustment needs

### Processing Times
Selected when:
- High average processing time
- Bottlenecks identified
- Efficiency concerns

**Sample Questions:**
- Bottleneck identification
- Processing bay utilization
- Staffing level assessment
- Equipment maintenance review
- Digital workflow evaluation

### Waste Type Compliance
Selected when:
- Multiple compliance issues (> 3)
- Waste classification problems
- Contract specification mismatches

**Sample Questions:**
- Waste classification procedures
- Heating value calculation accuracy
- Waste type distribution review
- Contract specification matching
- Producer documentation validation

## Selection Methods

### AI-Assisted (Preferred)
Uses MCP sampling to elicit the best focus area choice from AI based on facility context.

**Process:**
1. Present facility metrics to AI
2. Ask: "Which area needs most attention?"
3. AI selects from 4 options
4. Generate questions for selected area

### Metric-Based (Fallback)
Uses rule-based logic when sampling unavailable:

```typescript
if (contamination > 10) → "Contamination levels"
else if (acceptanceRate < 70%) → "Acceptance rates"  
else if (complianceIssues > 3) → "Waste type compliance"
else → "Processing times"
```

## Use Cases

### 1. Preparing for Facility Inspections

Generate questions before scheduled inspections:

```typescript
async function prepareInspection(facilityId: string, inspectorId: string) {
  const checklist = await getInspectionQuestions(facilityId);
  
  await sendToInspector(inspectorId, {
    facility: checklist.facilityName,
    focusArea: checklist.focusArea,
    questions: checklist.inspectionQuestions,
    notes: checklist.additionalNotes,
    metrics: checklist.facilityMetrics
  });
  
  return checklist;
}
```

### 2. Tailoring Inspections to Specific Concerns

Adjust inspection depth based on facility issues:

```typescript
const checklist = await getInspectionQuestions(facilityId);

if (checklist.additionalNotes.length > 0) {
  // High-priority inspection
  await scheduleDetailedInspection({
    facilityId,
    priority: 'HIGH',
    duration: 4, // hours
    checklist
  });
} else {
  // Standard inspection
  await scheduleStandardInspection({
    facilityId,
    duration: 2,
    checklist
  });
}
```

### 3. Training New Inspectors

Provide structured guidance for new team members:

```typescript
async function trainInspector(inspectorId: string, facilityIds: string[]) {
  const checklists = await Promise.all(
    facilityIds.map(id => getInspectionQuestions(id))
  );
  
  // Group by focus area
  const byFocusArea = groupBy(checklists, 'focusArea');
  
  await createTrainingModule({
    inspector: inspectorId,
    modules: Object.entries(byFocusArea).map(([area, lists]) => ({
      focusArea: area,
      facilities: lists.map(l => l.facilityName),
      commonQuestions: extractCommonQuestions(lists)
    }))
  });
}
```

### 4. Standardizing Inspection Procedures

Create consistent inspection frameworks:

```typescript
async function standardizeInspections() {
  const facilities = await listFacilities();
  const checklists = await Promise.all(
    facilities.map(f => getInspectionQuestions(f.id))
  );
  
  // Analyze common questions across all facilities
  const questionFrequency = analyzeQuestionFrequency(checklists);
  
  // Create standard baseline checklist
  const standardQuestions = questionFrequency
    .filter(q => q.frequency > 0.7) // In 70%+ of checklists
    .map(q => q.question);
  
  await updateStandardChecklist(standardQuestions);
}
```

## Question Customization

Questions are tailored to facility characteristics:

### High Contamination Scenario
```json
{
  "recentContaminants": 15,
  "questions": [
    "Are contamination detection systems functioning properly?",
    "What protocols are in place for high-risk contamination events?",
    "Review recent contamination logs - are patterns emerging?",
    "Are staff trained on latest contamination identification?",
    "Verify segregation procedures for contaminated waste",
    "Assess supplier communication on contamination prevention",
    "Review contamination incident documentation"
  ]
}
```

### Low Acceptance Rate Scenario
```json
{
  "acceptanceRate": "45.0%",
  "questions": [
    "Review rejection reasons for the past 30 days",
    "Are acceptance criteria clearly communicated to suppliers?",
    "Check if supplier education programs are effective",
    "Verify pre-arrival notification system is working",
    "Assess if acceptance criteria need adjustment"
  ]
}
```

## Additional Notes

The `additionalNotes` array provides context-specific alerts:

### High Contamination Activity
```
"High contamination activity - extra vigilance required"
```
Triggered when: `recentContaminants > 15`

### Low Acceptance Rate
```
"Low acceptance rate - investigate root causes"
```
Triggered when: `acceptanceRate < 50%`

### Significant Compliance Concerns
```
"Significant compliance concerns - detailed review needed"
```
Triggered when: `complianceIssues > 5`

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

### AI Generation Unavailable

If sampling fails, fallback questions are used from a question bank:

```json
{
  "selectionMethod": "metric-based",
  "inspectionQuestions": [
    "Are contamination detection systems functioning properly?",
    "What protocols are in place for high-risk contamination events?",
    ...
  ]
}
```

## Performance

- **Average Response Time:** ~400ms
- **Database Queries:** 4 (facility, inspections, contaminants, shipments)
- **AI Requests:** 2 (elicitation for focus area + question generation)
- **Data Analyzed:** Recent facility activity (10 inspections, 20 contaminants, 15 shipments)

## Best Practices

### 1. Generate Questions Just Before Inspection

Questions are most relevant when based on latest data:

```typescript
// Generate on-demand, not in advance
const checklist = await getInspectionQuestions(facilityId);
await conductInspection(facilityId, checklist);
```

### 2. Combine with Facility Report

Get comprehensive context:

```typescript
const [checklist, report] = await Promise.all([
  getInspectionQuestions(facilityId),
  generateFacilityReport(facilityId)
]);

await prepareInspectionPackage({
  checklist,
  healthScore: extractHealthScore(report),
  metrics: report.metrics
});
```

### 3. Track Question Effectiveness

Monitor which questions lead to findings:

```typescript
const checklist = await getInspectionQuestions(facilityId);
const results = await conductInspection(facilityId, checklist);

await trackQuestionEffectiveness({
  focusArea: checklist.focusArea,
  questions: checklist.inspectionQuestions,
  findings: results.findings,
  effectiveness: calculateEffectiveness(results)
});
```

### 4. Customize for Inspector Experience

Adjust question complexity:

```typescript
const inspector = await getInspector(inspectorId);
const checklist = await getInspectionQuestions(facilityId);

if (inspector.experienceLevel === 'junior') {
  checklist.inspectionQuestions = addGuidanceNotes(
    checklist.inspectionQuestions
  );
}
```

## Related Tools

- **[generate_intelligent_facility_report](./generate-facility-report.md)** - Comprehensive facility analysis
- **[analyze_shipment_risk](./analyze-shipment-risk.md)** - Shipment risk assessment
- **[list_inspections](../inspections/list-inspections.md)** - View inspection history
- **[get_facility](../facilities/get-facility.md)** - Get facility details

## See Also

- [Sampling Guide](../../guides/sampling-guide.md) - How AI elicitation works
- [AI Analysis Examples](../../examples/ai-analysis.md) - Complete workflows
- [Best Practices](../../guides/best-practices.md) - Inspection recommendations

---

**Need help?** Check the [Troubleshooting Guide](../../troubleshooting/common-issues.md) or review server logs for detailed information.

