import { logger } from './logger.js';

// Type definitions for sampling
export interface SamplingRequest {
  id: string;
  method: 'sampling/createMessage';
  params: {
    messages: Array<{
      role: 'user' | 'assistant';
      content: {
        type: 'text';
        text: string;
      };
    }>;
    maxTokens?: number;
    temperature?: number;
    modelPreferences?: {
      hints?: Array<{ name?: string }>;
      costPriority?: number;
      speedPriority?: number;
      intelligencePriority?: number;
    };
  };
}

export interface SamplingResponse {
  role: 'assistant';
  content: {
    type: 'text';
    text: string;
  };
  model: string;
  stopReason?: string;
}

export interface RiskScore {
  score: number;
  reasoning: string;
}

// Global sampling callback - will be set by the server
let samplingCallback: ((request: SamplingRequest) => Promise<SamplingResponse>) | null = null;

/**
 * Set the sampling callback function
 * This should be called by the server to enable sampling
 */
export function setSamplingCallback(
  callback: (request: SamplingRequest) => Promise<SamplingResponse>
) {
  samplingCallback = callback;
  logger.info('[Sampling] Callback registered');
}

/**
 * Generate a unique request ID for sampling requests
 */
function generateRequestId(): string {
  return `sampling-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Internal function to make a sampling request with timeout
 */
async function makeSamplingRequest(
  prompt: string,
  maxTokens: number = 1000,
  temperature: number = 0.7
): Promise<string> {
  if (!samplingCallback) {
    throw new Error('Sampling is not available - no callback registered');
  }

  const requestId = generateRequestId();
  
  const request: SamplingRequest = {
    id: requestId,
    method: 'sampling/createMessage',
    params: {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
      maxTokens,
      temperature,
      modelPreferences: {
        intelligencePriority: 0.8,
        speedPriority: 0.5,
        costPriority: 0.3,
      },
    },
  };

  logger.info(`[Sampling] Making request ${requestId}`);
  logger.debug(`[Sampling] Request prompt: ${prompt.substring(0, 100)}...`);

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sampling request timed out after 30 seconds')), 30000);
    });

    // Race between sampling and timeout
    const response = await Promise.race([
      samplingCallback(request),
      timeoutPromise,
    ]);

    logger.info(`[Sampling] Request ${requestId} completed successfully`);
    logger.debug(`[Sampling] Response: ${response.content.text.substring(0, 100)}...`);

    return response.content.text;
  } catch (error: any) {
    logger.error(`[Sampling] Request ${requestId} failed:`, error.message);
    throw error;
  }
}

/**
 * Request AI analysis with context data
 * @param prompt - The analysis prompt
 * @param data - Contextual data to analyze
 * @returns AI-generated analysis text
 */
export async function requestAnalysis(prompt: string, data: any): Promise<string> {
  const fullPrompt = `${prompt}\n\nData to analyze:\n${JSON.stringify(data, null, 2)}`;
  
  try {
    return await makeSamplingRequest(fullPrompt, 1500, 0.7);
  } catch (error: any) {
    logger.error('[Sampling] Analysis request failed:', error.message);
    throw new Error(`Failed to get AI analysis: ${error.message}`);
  }
}

/**
 * Request a risk score assessment
 * @param context - Context description for risk assessment
 * @returns Risk score (0-100) and reasoning
 */
export async function requestRiskScore(context: string): Promise<RiskScore> {
  const prompt = `Assess the risk level based on the following context. Provide your response in JSON format with "score" (0-100, where 0 is no risk and 100 is critical risk) and "reasoning" (brief explanation).

Context:
${context}

Response format:
{
  "score": <number 0-100>,
  "reasoning": "<explanation>"
}`;

  try {
    const response = await makeSamplingRequest(prompt, 500, 0.5);
    
    // Try to parse JSON response
    try {
      // Extract JSON from response (handles cases where AI adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(0, Math.min(100, parsed.score || 0)),
          reasoning: parsed.reasoning || response,
        };
      }
    } catch (parseError) {
      logger.warn('[Sampling] Could not parse risk score JSON, using fallback');
    }

    // Fallback: try to extract a number and use full response as reasoning
    const numberMatch = response.match(/\b(\d{1,3})\b/);
    const score = numberMatch ? parseInt(numberMatch[1]) : 50;
    
    return {
      score: Math.max(0, Math.min(100, score)),
      reasoning: response,
    };
  } catch (error: any) {
    logger.error('[Sampling] Risk score request failed:', error.message);
    throw new Error(`Failed to get risk score: ${error.message}`);
  }
}

/**
 * Elicit a choice from available options
 * @param question - The question to ask
 * @param options - Array of option strings
 * @returns The selected option text
 */
export async function elicitChoice(question: string, options: string[]): Promise<string> {
  const optionsText = options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n');
  
  const prompt = `${question}

Options:
${optionsText}

Please select one option by responding with just the letter (A, B, C, etc.) followed by a brief explanation of why.`;

  try {
    const response = await makeSamplingRequest(prompt, 300, 0.3);
    
    // Try to extract the selected letter
    const letterMatch = response.match(/\b([A-Z])\b/);
    if (letterMatch) {
      const selectedIndex = letterMatch[1].charCodeAt(0) - 65;
      if (selectedIndex >= 0 && selectedIndex < options.length) {
        const selected = options[selectedIndex];
        logger.info(`[Sampling] Choice selected: ${selected}`);
        return selected;
      }
    }

    // Fallback: return first option
    logger.warn('[Sampling] Could not determine choice, using first option');
    return options[0];
  } catch (error: any) {
    logger.error('[Sampling] Choice elicitation failed:', error.message);
    throw new Error(`Failed to elicit choice: ${error.message}`);
  }
}

/**
 * Check if sampling is available
 */
export function isSamplingAvailable(): boolean {
  return samplingCallback !== null;
}

