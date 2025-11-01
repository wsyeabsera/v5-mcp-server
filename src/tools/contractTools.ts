import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Contract } from '../models/index.js';

// Define schemas
const createContractSchema = z.object({
  producerName: z.string().describe('Producer name'),
  debitorName: z.string().describe('Debitor name'),
  wasteCode: z.string().describe('Waste code'),
});

const getContractSchema = z.object({
  id: z.string().describe('Contract ID'),
});

const listContractsSchema = z.object({
  producerName: z.string().optional().describe('Filter by producer name'),
  debitorName: z.string().optional().describe('Filter by debitor name'),
  wasteCode: z.string().optional().describe('Filter by waste code'),
});

const updateContractSchema = z.object({
  id: z.string().describe('Contract ID'),
  producerName: z.string().optional().describe('Producer name'),
  debitorName: z.string().optional().describe('Debitor name'),
  wasteCode: z.string().optional().describe('Waste code'),
});

const deleteContractSchema = z.object({
  id: z.string().describe('Contract ID'),
});

export const contractTools = {
  create_contract: {
    description: 'Create a new contract',
    inputSchema: zodToJsonSchema(createContractSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof createContractSchema>) => {
      try {
        const validatedArgs = createContractSchema.parse(args);
        const contract = await Contract.create(validatedArgs);
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
    inputSchema: zodToJsonSchema(getContractSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof getContractSchema>) => {
      try {
        const validatedArgs = getContractSchema.parse(args);
        const contract = await Contract.findById(validatedArgs.id);
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
    inputSchema: zodToJsonSchema(listContractsSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof listContractsSchema>) => {
      try {
        const validatedArgs = listContractsSchema.parse(args);
        const filter: any = {};
        if (validatedArgs.producerName) filter.producerName = { $regex: validatedArgs.producerName, $options: 'i' };
        if (validatedArgs.debitorName) filter.debitorName = { $regex: validatedArgs.debitorName, $options: 'i' };
        if (validatedArgs.wasteCode) filter.wasteCode = validatedArgs.wasteCode;

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
    inputSchema: zodToJsonSchema(updateContractSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof updateContractSchema>) => {
      try {
        const validatedArgs = updateContractSchema.parse(args);
        const updateData: any = {};
        if (validatedArgs.producerName) updateData.producerName = validatedArgs.producerName;
        if (validatedArgs.debitorName) updateData.debitorName = validatedArgs.debitorName;
        if (validatedArgs.wasteCode) updateData.wasteCode = validatedArgs.wasteCode;

        const contract = await Contract.findByIdAndUpdate(validatedArgs.id, updateData, { new: true });
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
    inputSchema: zodToJsonSchema(deleteContractSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof deleteContractSchema>) => {
      try {
        const validatedArgs = deleteContractSchema.parse(args);
        const contract = await Contract.findByIdAndDelete(validatedArgs.id);
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
