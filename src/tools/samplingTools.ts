import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Facility, Contaminant, Inspection, Shipment } from '../models/index.js';
import { requestAnalysis, requestRiskScore, elicitChoice, isSamplingAvailable } from '../utils/sampling.js';
import { logger } from '../utils/logger.js';

// Define schemas
const generateIntelligentFacilityReportSchema = z.object({
  facilityId: z.string().describe('Facility ID to generate report for'),
  includeRecommendations: z.boolean().optional().describe('Whether to include AI recommendations'),
});

const analyzeShipmentRiskSchema = z.object({
  shipmentId: z.string().describe('Shipment ID to analyze'),
});

const suggestInspectionQuestionsSchema = z.object({
  facilityId: z.string().describe('Facility ID to generate inspection questions for'),
});

export const samplingTools = {
  generate_intelligent_facility_report: {
    description: 'Generate an intelligent facility report with AI-powered analysis including health score, concerns, and recommendations',
    inputSchema: zodToJsonSchema(generateIntelligentFacilityReportSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof generateIntelligentFacilityReportSchema>) => {
      try {
        const validatedArgs = generateIntelligentFacilityReportSchema.parse(args);
        const { facilityId, includeRecommendations = false } = validatedArgs;

        logger.info(`[Sampling Tool] Generating intelligent report for facility: ${facilityId}`);

        // Fetch facility data
        const facility = await Facility.findById(facilityId);
        if (!facility) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Facility not found' }, null, 2),
              },
            ],
            isError: true,
          };
        }

        // Fetch related data
        const inspections = await Inspection.find({ facility_id: facilityId }).limit(20).sort({ createdAt: -1 });
        const contaminants = await Contaminant.find({ facilityId }).limit(50).sort({ detection_time: -1 });
        const shipments = await Shipment.find({ facilityId }).limit(30).sort({ entry_timestamp: -1 });

        // Calculate basic metrics
        const totalInspections = inspections.length;
        const acceptedInspections = inspections.filter(i => i.is_delivery_accepted).length;
        const acceptanceRate = totalInspections > 0 ? (acceptedInspections / totalInspections * 100).toFixed(2) : '0';
        const totalContaminants = contaminants.length;
        const highRiskContaminants = contaminants.filter(c => 
          c.explosive_level === 'high' || c.hcl_level === 'high' || c.so2_level === 'high'
        ).length;

        // Prepare data for AI analysis
        const dataForAnalysis = {
          facility: {
            name: facility.name,
            location: facility.location,
            shortCode: facility.shortCode,
          },
          metrics: {
            totalInspections,
            acceptanceRate: `${acceptanceRate}%`,
            totalContaminants,
            highRiskContaminants,
            totalShipments: shipments.length,
          },
          recentContaminants: contaminants.slice(0, 5).map(c => ({
            type: c.wasteItemDetected,
            material: c.material,
            explosive_level: c.explosive_level,
            hcl_level: c.hcl_level,
            so2_level: c.so2_level,
            detection_time: c.detection_time,
          })),
          recentInspections: inspections.slice(0, 5).map(i => ({
            accepted: i.is_delivery_accepted,
            meetsConditions: i.does_delivery_meets_conditions,
            heatingValue: i.heating_value_calculation,
            wasteTypes: i.selected_wastetypes,
            date: i.createdAt,
          })),
        };

        let aiAnalysis = null;
        let samplingError = null;

        // Request AI analysis if sampling is available
        if (isSamplingAvailable()) {
          try {
            const prompt = `Analyze this waste management facility and provide:
1. Overall health score (0-100, where 100 is excellent)
2. Top 3 concerns (bullet points)
3. Compliance risk level (low/medium/high)
${includeRecommendations ? '4. 3 actionable recommendations for improvement' : ''}

Provide a structured analysis based on the facility data.`;

            const analysisText = await requestAnalysis(prompt, dataForAnalysis);
            
            // Parse AI response
            aiAnalysis = {
              rawAnalysis: analysisText,
              timestamp: new Date().toISOString(),
            };
          } catch (error: any) {
            samplingError = error.message;
            logger.error('[Sampling Tool] AI analysis failed:', error);
          }
        } else {
          samplingError = 'Sampling not available - AI analysis skipped';
        }

        // Compile comprehensive report
        const report = {
          reportId: `RPT-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          facility: {
            id: facility._id,
            name: facility.name,
            location: facility.location,
            shortCode: facility.shortCode,
          },
          metrics: {
            inspections: {
              total: totalInspections,
              accepted: acceptedInspections,
              acceptanceRate: `${acceptanceRate}%`,
            },
            contamination: {
              total: totalContaminants,
              highRisk: highRiskContaminants,
              riskPercentage: totalContaminants > 0 ? 
                `${(highRiskContaminants / totalContaminants * 100).toFixed(2)}%` : '0%',
            },
            shipments: {
              total: shipments.length,
            },
          },
          aiAnalysis: aiAnalysis || { note: samplingError },
          rawData: {
            recentContaminants: contaminants.slice(0, 10),
            recentInspections: inspections.slice(0, 10),
            recentShipments: shipments.slice(0, 10),
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(report, null, 2),
            },
          ],
        };
      } catch (error: any) {
        logger.error('[Sampling Tool] Error generating facility report:', error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Error generating report: ${error.message}` }, null, 2),
            },
          ],
          isError: true,
        };
      }
    },
  },

  analyze_shipment_risk: {
    description: 'Analyze shipment risk using AI to assess contamination patterns and historical data',
    inputSchema: zodToJsonSchema(analyzeShipmentRiskSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof analyzeShipmentRiskSchema>) => {
      try {
        const validatedArgs = analyzeShipmentRiskSchema.parse(args);
        const { shipmentId } = validatedArgs;

        logger.info(`[Sampling Tool] Analyzing shipment risk: ${shipmentId}`);

        // Fetch shipment data
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Shipment not found' }, null, 2),
              },
            ],
            isError: true,
          };
        }

        // Fetch related data
        const facility = await Facility.findById(shipment.facilityId);
        const contaminants = await Contaminant.find({ shipment_id: shipmentId });
        const sourceShipments = await Shipment.find({ 
          source: shipment.source,
          _id: { $ne: shipmentId }
        }).limit(10).sort({ entry_timestamp: -1 });

        // Calculate basic risk indicators
        const hasContaminants = contaminants.length > 0;
        const highRiskContaminants = contaminants.filter(c => 
          c.explosive_level === 'high' || c.hcl_level === 'high' || c.so2_level === 'high'
        ).length;
        
        const sourceContaminantHistory = await Contaminant.find({
          shipment_id: { $in: sourceShipments.map(s => String(s._id)) }
        });

        // Prepare context for AI risk scoring
        const riskContext = `
Shipment Information:
- ID: ${shipmentId}
- Source: ${shipment.source}
- Facility: ${facility?.name || 'Unknown'}
- License Plate: ${shipment.license_plate}
- Entry: ${shipment.entry_timestamp}
- Exit: ${shipment.exit_timestamp}

Current Shipment Contaminants:
- Total detected: ${contaminants.length}
- High risk: ${highRiskContaminants}
${contaminants.length > 0 ? contaminants.map(c => 
  `  - ${c.wasteItemDetected} (${c.material}): explosive=${c.explosive_level}, HCl=${c.hcl_level}, SO2=${c.so2_level}`
).join('\n') : '  None'}

Source History (${shipment.source}):
- Previous shipments: ${sourceShipments.length}
- Historical contaminants: ${sourceContaminantHistory.length}
- Historical high risk: ${sourceContaminantHistory.filter(c => 
  c.explosive_level === 'high' || c.hcl_level === 'high' || c.so2_level === 'high'
).length}
`;

        let aiRiskScore = null;
        let samplingError = null;

        // Request AI risk scoring if sampling is available
        if (isSamplingAvailable()) {
          try {
            const riskAssessment = await requestRiskScore(riskContext);
            aiRiskScore = riskAssessment;
          } catch (error: any) {
            samplingError = error.message;
            logger.error('[Sampling Tool] Risk scoring failed:', error);
          }
        } else {
          samplingError = 'Sampling not available - AI risk scoring skipped';
        }

        // Calculate fallback risk score
        const fallbackScore = Math.min(100, 
          (contaminants.length * 10) + 
          (highRiskContaminants * 25) + 
          (sourceContaminantHistory.length * 2)
        );

        // Compile risk assessment
        const assessment = {
          shipmentId,
          assessedAt: new Date().toISOString(),
          shipment: {
            source: shipment.source,
            licensePlate: shipment.license_plate,
            facility: facility?.name,
            duration: Math.round((shipment.exit_timestamp.getTime() - shipment.entry_timestamp.getTime()) / 60000) + ' minutes',
          },
          riskIndicators: {
            currentContaminants: contaminants.length,
            highRiskContaminants,
            sourceHistoryContaminants: sourceContaminantHistory.length,
            sourceHistoryShipments: sourceShipments.length,
          },
          aiRiskScore: aiRiskScore || {
            note: samplingError,
            fallbackScore,
            fallbackReasoning: 'Calculated based on contamination count and severity levels',
          },
          riskFactors: [
            contaminants.length > 0 && 'Contaminants detected in current shipment',
            highRiskContaminants > 0 && 'High-risk contaminants present',
            sourceContaminantHistory.length > 5 && 'Source has contamination history',
            sourceShipments.length < 3 && 'Limited history from this source',
          ].filter(Boolean),
          recommendedActions: [
            highRiskContaminants > 0 && 'Immediate inspection required',
            contaminants.length > 0 && 'Enhanced monitoring for future shipments from this source',
            sourceContaminantHistory.length > 5 && 'Consider source evaluation',
            'Document all findings in compliance report',
          ].filter(Boolean),
          detailedContaminants: contaminants,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(assessment, null, 2),
            },
          ],
        };
      } catch (error: any) {
        logger.error('[Sampling Tool] Error analyzing shipment risk:', error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Error analyzing shipment: ${error.message}` }, null, 2),
            },
          ],
          isError: true,
        };
      }
    },
  },

  suggest_inspection_questions: {
    description: 'Generate customized inspection questions based on facility history using AI elicitation',
    inputSchema: zodToJsonSchema(suggestInspectionQuestionsSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof suggestInspectionQuestionsSchema>) => {
      try {
        const validatedArgs = suggestInspectionQuestionsSchema.parse(args);
        const { facilityId } = validatedArgs;

        logger.info(`[Sampling Tool] Generating inspection questions for facility: ${facilityId}`);

        // Fetch facility data
        const facility = await Facility.findById(facilityId);
        if (!facility) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ error: 'Facility not found' }, null, 2),
              },
            ],
            isError: true,
          };
        }

        // Fetch recent activity
        const recentInspections = await Inspection.find({ facility_id: facilityId })
          .limit(10)
          .sort({ createdAt: -1 });
        const recentContaminants = await Contaminant.find({ facilityId })
          .limit(20)
          .sort({ detection_time: -1 });
        const recentShipments = await Shipment.find({ facilityId })
          .limit(15)
          .sort({ entry_timestamp: -1 });

        // Calculate focus area metrics
        const contaminationScore = recentContaminants.length;
        const acceptanceRate = recentInspections.length > 0 ?
          recentInspections.filter(i => i.is_delivery_accepted).length / recentInspections.length : 1;
        const avgProcessingTime = recentShipments.length > 0 ?
          recentShipments.reduce((sum, s) => 
            sum + (s.exit_timestamp.getTime() - s.entry_timestamp.getTime()), 0
          ) / recentShipments.length / 60000 : 0;
        const complianceIssues = recentInspections.filter(i => !i.does_delivery_meets_conditions).length;

        let selectedFocus = 'Contamination levels'; // Default
        let samplingError = null;

        // Use elicitation to determine focus area if sampling is available
        if (isSamplingAvailable()) {
          try {
            const question = `Based on this facility's recent history, which area needs most attention for the next inspection?`;
            const options = [
              'Contamination levels',
              'Acceptance rates',
              'Processing times',
              'Waste type compliance',
            ];

            selectedFocus = await elicitChoice(question, options);
            logger.info(`[Sampling Tool] Selected focus area: ${selectedFocus}`);
          } catch (error: any) {
            samplingError = error.message;
            logger.error('[Sampling Tool] Elicitation failed:', error);
            // Use metric-based selection as fallback
            if (contaminationScore > 10) selectedFocus = 'Contamination levels';
            else if (acceptanceRate < 0.7) selectedFocus = 'Acceptance rates';
            else if (complianceIssues > 3) selectedFocus = 'Waste type compliance';
            else selectedFocus = 'Processing times';
          }
        } else {
          samplingError = 'Sampling not available - using metric-based focus selection';
          // Metric-based selection
          if (contaminationScore > 10) selectedFocus = 'Contamination levels';
          else if (acceptanceRate < 0.7) selectedFocus = 'Acceptance rates';
          else if (complianceIssues > 3) selectedFocus = 'Waste type compliance';
          else selectedFocus = 'Processing times';
        }

        // Generate targeted questions using AI if available
        let inspectionQuestions: string[] = [];
        
        if (isSamplingAvailable() && !samplingError) {
          try {
            const prompt = `Generate a checklist of 5-7 specific inspection questions focused on "${selectedFocus}" for a waste management facility with the following characteristics:
- Recent contaminants detected: ${contaminationScore}
- Acceptance rate: ${(acceptanceRate * 100).toFixed(1)}%
- Compliance issues: ${complianceIssues}
- Average processing time: ${avgProcessingTime.toFixed(0)} minutes

Return only the numbered questions, one per line.`;

            const questionsText = await requestAnalysis(prompt, {
              focusArea: selectedFocus,
              facilityMetrics: {
                contaminants: contaminationScore,
                acceptanceRate: `${(acceptanceRate * 100).toFixed(1)}%`,
                complianceIssues,
                avgProcessingTime: `${avgProcessingTime.toFixed(0)} minutes`,
              },
            });

            // Parse questions from response
            inspectionQuestions = questionsText
              .split('\n')
              .filter(line => line.trim().match(/^\d+[\.\)]/))
              .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
              .filter(q => q.length > 0);
          } catch (error: any) {
            logger.error('[Sampling Tool] Question generation failed:', error);
          }
        }

        // Fallback questions if AI generation failed
        if (inspectionQuestions.length === 0) {
          const questionBank: Record<string, string[]> = {
            'Contamination levels': [
              'Are contamination detection systems functioning properly?',
              'What protocols are in place for high-risk contamination events?',
              'Review recent contamination logs - are patterns emerging?',
              'Are staff trained on latest contamination identification procedures?',
              'Verify segregation procedures for contaminated waste streams',
            ],
            'Acceptance rates': [
              'Review rejection reasons for the past 30 days',
              'Are acceptance criteria clearly communicated to suppliers?',
              'Check if supplier education programs are effective',
              'Verify pre-arrival notification system is working',
              'Assess if acceptance criteria need adjustment',
            ],
            'Processing times': [
              'Identify bottlenecks in the receiving process',
              'Are processing bays optimally utilized?',
              'Review staffing levels during peak hours',
              'Check equipment maintenance schedules',
              'Evaluate digital workflow systems',
            ],
            'Waste type compliance': [
              'Verify waste classification procedures',
              'Check that heating value calculations are accurate',
              'Review waste type percentage distributions',
              'Ensure contract-specified waste types match deliveries',
              'Validate waste producer documentation',
            ],
          };

          inspectionQuestions = questionBank[selectedFocus] || questionBank['Contamination levels'];
        }

        // Compile inspection checklist
        const checklist = {
          facilityId,
          facilityName: facility.name,
          generatedAt: new Date().toISOString(),
          focusArea: selectedFocus,
          selectionMethod: samplingError ? 'metric-based' : 'AI-assisted',
          facilityMetrics: {
            recentContaminants: contaminationScore,
            acceptanceRate: `${(acceptanceRate * 100).toFixed(1)}%`,
            avgProcessingTime: `${avgProcessingTime.toFixed(0)} minutes`,
            complianceIssues,
          },
          inspectionQuestions,
          additionalNotes: [
            contaminationScore > 15 && 'High contamination activity - extra vigilance required',
            acceptanceRate < 0.5 && 'Low acceptance rate - investigate root causes',
            complianceIssues > 5 && 'Significant compliance concerns - detailed review needed',
          ].filter(Boolean),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(checklist, null, 2),
            },
          ],
        };
      } catch (error: any) {
        logger.error('[Sampling Tool] Error generating inspection questions:', error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Error generating questions: ${error.message}` }, null, 2),
            },
          ],
          isError: true,
        };
      }
    },
  },
};

