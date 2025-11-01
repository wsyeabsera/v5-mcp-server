import { z } from 'zod';
import { Contract } from '../models/index.js';

export const contractTools = {
  create_contract: {
    description: 'Create a new contract',
    inputSchema: z.object({
      producerName: z.string().describe('Producer name'),
      debitorName: z.string().describe('Debitor name'),
      wasteCode: z.string().describe('Waste code'),
    }),
    handler: async (args: { producerName: string; debitorName: string; wasteCode: string }) => {
      try {
        const contract = await Contract.create(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contract, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating contract: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  get_contract: {
    description: 'Get a contract by ID',
    inputSchema: z.object({
      id: z.string().describe('Contract ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const contract = await Contract.findById(args.id);
        if (!contract) {
          return {
            content: [
              {
                type: 'text',
                text: 'Contract not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contract, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting contract: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  list_contracts: {
    description: 'List all contracts with optional filters',
    inputSchema: z.object({
      producerName: z.string().optional().describe('Filter by producer name'),
      debitorName: z.string().optional().describe('Filter by debitor name'),
      wasteCode: z.string().optional().describe('Filter by waste code'),
    }),
    handler: async (args: { producerName?: string; debitorName?: string; wasteCode?: string }) => {
      try {
        const filter: any = {};
        if (args.producerName) filter.producerName = { $regex: args.producerName, $options: 'i' };
        if (args.debitorName) filter.debitorName = { $regex: args.debitorName, $options: 'i' };
        if (args.wasteCode) filter.wasteCode = args.wasteCode;

        const contracts = await Contract.find(filter);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contracts, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error listing contracts: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  update_contract: {
    description: 'Update a contract by ID',
    inputSchema: z.object({
      id: z.string().describe('Contract ID'),
      producerName: z.string().optional().describe('Producer name'),
      debitorName: z.string().optional().describe('Debitor name'),
      wasteCode: z.string().optional().describe('Waste code'),
    }),
    handler: async (args: {
      id: string;
      producerName?: string;
      debitorName?: string;
      wasteCode?: string;
    }) => {
      try {
        const updateData: any = {};
        if (args.producerName) updateData.producerName = args.producerName;
        if (args.debitorName) updateData.debitorName = args.debitorName;
        if (args.wasteCode) updateData.wasteCode = args.wasteCode;

        const contract = await Contract.findByIdAndUpdate(args.id, updateData, { new: true });
        if (!contract) {
          return {
            content: [
              {
                type: 'text',
                text: 'Contract not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contract, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating contract: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  delete_contract: {
    description: 'Delete a contract by ID',
    inputSchema: z.object({
      id: z.string().describe('Contract ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const contract = await Contract.findByIdAndDelete(args.id);
        if (!contract) {
          return {
            content: [
              {
                type: 'text',
                text: 'Contract not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Contract deleted successfully: ${contract.producerName}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error deleting contract: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};

