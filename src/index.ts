import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { config } from './config.js';
import {
  facilityTools,
  contaminantTools,
  inspectionTools,
  shipmentTools,
  contractTools,
  samplingTools,
} from './tools/index.js';
import { logger } from './utils/logger.js';
import { prompts, generatePromptMessages } from './prompts/index.js';
import { listResources, readResource } from './resources/index.js';
import { setSamplingCallback, SamplingRequest, SamplingResponse } from './utils/sampling.js';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
await connectDB(config.mongoUri);

// Set up sampling callback for testing
// In a production environment, this would integrate with the MCP client's sampling capability
// For now, we'll use a mock implementation that provides reasonable AI-like responses
setSamplingCallback(async (request: SamplingRequest): Promise<SamplingResponse> => {
  logger.info(`[Sampling] Processing request: ${request.id}`);
  
  const userMessage = request.params.messages[0]?.content?.text || '';
  
  // Mock AI responses based on prompt content
  let responseText = '';
  
  if (userMessage.includes('health score') || userMessage.includes('Overall health score')) {
    responseText = `Based on the facility data analysis:

1. **Overall Health Score: 78/100**
   - Good acceptance rate indicates proper waste handling
   - Moderate contamination levels require attention
   - Generally compliant operations with room for improvement

2. **Top 3 Concerns:**
   - Increasing contamination detection trends in recent shipments
   - Some high-risk contaminants requiring immediate attention
   - Occasional compliance issues with waste type specifications

3. **Compliance Risk Level: MEDIUM**
   - Current operations meet basic requirements
   - Some areas need enhanced monitoring
   - Proactive measures recommended to prevent escalation

${request.params.messages[0]?.content?.text.includes('recommendations') ? `4. **3 Actionable Recommendations:**
   - Implement enhanced pre-screening for high-risk sources
   - Increase staff training on contamination identification
   - Establish monthly compliance review meetings` : ''}`;
  } else if (userMessage.includes('risk level') || userMessage.includes('Assess risk')) {
    responseText = `{
  "score": 65,
  "reasoning": "Moderate risk level due to detected contaminants and source history. The presence of high-risk materials and limited historical data from this source warrant enhanced scrutiny. Recommended actions include thorough inspection and source verification."
}`;
  } else if (userMessage.includes('which area needs most attention') || userMessage.includes('Options:')) {
    responseText = `A) Contamination levels

The facility shows a pattern of contamination detections that warrants focused attention. While other metrics are stable, addressing contamination proactively will prevent future compliance issues and operational disruptions.`;
  } else if (userMessage.includes('inspection questions') || userMessage.includes('checklist')) {
    responseText = `1. Are contamination detection systems functioning properly and calibrated?
2. What protocols are currently in place for handling high-risk contamination events?
3. Review recent contamination logs - are there emerging patterns by source or waste type?
4. Verify that staff members are trained on the latest contamination identification procedures
5. Check segregation procedures for contaminated waste streams
6. Assess the effectiveness of supplier communication regarding contamination prevention
7. Review documentation procedures for contamination incidents`;
  } else {
    // Generic analysis response
    responseText = `Analysis of the provided data:

The facility demonstrates operational competency with areas for improvement. Key observations include stable processing metrics, manageable contamination levels, and generally compliant operations. Continued monitoring and proactive management are recommended to maintain and improve performance standards.

Specific attention should be paid to contamination trends, acceptance criteria consistency, and ongoing staff training to ensure sustained compliance and operational excellence.`;
  }
  
  return {
    role: 'assistant',
    content: {
      type: 'text',
      text: responseText,
    },
    model: 'mock-ai-model',
    stopReason: 'endTurn',
  };
});

// Combine all tools
const allTools = {
  ...facilityTools,
  ...contaminantTools,
  ...inspectionTools,
  ...shipmentTools,
  ...contractTools,
  ...samplingTools,
};

// Simple HTTP MCP endpoint (handles JSON-RPC directly)
app.post('/sse', async (req: Request, res: Response) => {
  logger.info('[MCP] Received JSON-RPC request:', req.body);

  try {
    const { jsonrpc, id, method, params } = req.body;

    // Validate JSON-RPC format
    if (jsonrpc !== '2.0') {
      return res.json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0"',
        },
        id: null,
      });
    }

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
            sampling: {}
          },
        },
        id,
      });
    }

    // Handle tools/list
    if (method === 'tools/list') {
      logger.info('[MCP] Handling tools/list');
      return res.json({
        jsonrpc: '2.0',
        result: {
          tools: Object.entries(allTools).map(([name, tool]) => ({
            name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        },
        id,
      });
    }

    // Handle tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      logger.info(`[MCP] Handling tools/call for: ${toolName}`);

      const tool = allTools[toolName as keyof typeof allTools];

      if (!tool) {
        return res.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${toolName}`,
              },
            ],
            isError: true,
          },
          id,
        });
      }

      try {
        // Handler does validation internally
        const result = await tool.handler(params?.arguments || {});
        
        return res.json({
          jsonrpc: '2.0',
          result,
          id,
        });
      } catch (error: any) {
        logger.error(`[MCP] Error executing tool ${toolName}:`, error);
        return res.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: `Error executing tool ${toolName}: ${error.message}`,
              },
            ],
            isError: true,
          },
          id,
        });
      }
    }

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
      const messages = generatePromptMessages(promptName, args);

      return res.json({
        jsonrpc: '2.0',
        result: {
          description: prompt.description,
          messages
        },
        id,
      });
    }

    // Handle resources/list
    if (method === 'resources/list') {
      logger.info('[MCP] Handling resources/list');
      try {
        const result = await listResources();
        return res.json({
          jsonrpc: '2.0',
          result,
          id,
        });
      } catch (error: any) {
        logger.error('[MCP] Error listing resources:', error);
        return res.json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: `Error listing resources: ${error.message}`
          },
          id,
        });
      }
    }

    // Handle resources/read
    if (method === 'resources/read') {
      const uri = params?.uri;
      logger.info(`[MCP] Handling resources/read for: ${uri}`);

      try {
        const result = await readResource(uri);
        return res.json({
          jsonrpc: '2.0',
          result,
          id,
        });
      } catch (error: any) {
        logger.error(`[MCP] Error reading resource ${uri}:`, error);
        return res.json({
          jsonrpc: '2.0',
          error: {
            code: -32602,
            message: error.message
          },
          id,
        });
      }
    }

    // Unknown method
    return res.json({
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
      id,
    });

  } catch (error: any) {
    logger.error('[MCP] Request handling error:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal server error',
        data: error.message,
      },
      id: req.body?.id || null,
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint with server info
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Waste Management MCP Server',
    version: '1.0.0',
    description: 'Simple HTTP MCP Server with TypeScript and Mongoose',
    endpoints: {
      mcp: '/sse (POST)',
      health: '/health',
    },
    tools: Object.keys(allTools).length,
    collections: ['facilities', 'contaminants', 'inspections', 'shipments', 'contracts'],
  });
});

// Start server
app.listen(config.port, () => {
  logger.info(`MCP Server running on http://localhost:${config.port}`);
  logger.info(`MCP endpoint: http://localhost:${config.port}/sse`);
  logger.info(`Health check: http://localhost:${config.port}/health`);
  logger.info(`Total tools available: ${Object.keys(allTools).length}`);
});

