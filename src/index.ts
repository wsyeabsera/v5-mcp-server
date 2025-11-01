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
} from './tools/index.js';
import { logger } from './utils/logger.js';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
await connectDB(config.mongoUri);

// Combine all tools
const allTools = {
  ...facilityTools,
  ...contaminantTools,
  ...inspectionTools,
  ...shipmentTools,
  ...contractTools,
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

