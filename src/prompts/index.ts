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

// Generate prompt messages based on prompt name and arguments
export function generatePromptMessages(promptName: string, args: Record<string, any>) {
  if (promptName === 'analyze-facility-compliance') {
    const { facilityId, timeRange = '30days' } = args;
    return [
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
    
    return [
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
    return [
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
    return [
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

  return [];
}

