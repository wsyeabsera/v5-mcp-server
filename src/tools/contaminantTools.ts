import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Contaminant } from '../models/index.js';

const levelEnum = z.enum(['low', 'medium', 'high']);

// Define schemas
const createContaminantSchema = z.object({
  wasteItemDetected: z.string().describe('Waste item detected'),
  material: z.string().describe('Material type'),
  facilityId: z.string().describe('Facility ID'),
  detection_time: z.string().describe('Detection time (ISO 8601 format)'),
  explosive_level: levelEnum.describe('Explosive level'),
  hcl_level: levelEnum.describe('HCl level'),
  so2_level: levelEnum.describe('SO2 level'),
  estimated_size: z.number().describe('Estimated size'),
  shipment_id: z.string().describe('Shipment ID'),
});

const getContaminantSchema = z.object({
  id: z.string().describe('Contaminant ID'),
});

const listContaminantsSchema = z.object({
  facilityId: z.string().optional().describe('Filter by facility ID'),
  shipment_id: z.string().optional().describe('Filter by shipment ID'),
  material: z.string().optional().describe('Filter by material'),
});

const updateContaminantSchema = z.object({
  id: z.string().describe('Contaminant ID'),
  wasteItemDetected: z.string().optional().describe('Waste item detected'),
  material: z.string().optional().describe('Material type'),
  facilityId: z.string().optional().describe('Facility ID'),
  detection_time: z.string().optional().describe('Detection time (ISO 8601 format)'),
  explosive_level: levelEnum.optional().describe('Explosive level'),
  hcl_level: levelEnum.optional().describe('HCl level'),
  so2_level: levelEnum.optional().describe('SO2 level'),
  estimated_size: z.number().optional().describe('Estimated size'),
  shipment_id: z.string().optional().describe('Shipment ID'),
});

const deleteContaminantSchema = z.object({
  id: z.string().describe('Contaminant ID'),
});

export const contaminantTools = {
  create_contaminant: {
    description: 'Create a new contaminant record',
    inputSchema: zodToJsonSchema(createContaminantSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof createContaminantSchema>) => {
      try {
        const validatedArgs = createContaminantSchema.parse(args);
        const contaminant = await Contaminant.create({
          ...validatedArgs,
          detection_time: new Date(validatedArgs.detection_time),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contaminant, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating contaminant: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  get_contaminant: {
    description: 'Get a contaminant by ID',
    inputSchema: zodToJsonSchema(getContaminantSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof getContaminantSchema>) => {
      try {
        const validatedArgs = getContaminantSchema.parse(args);
        const contaminant = await Contaminant.findById(validatedArgs.id).populate('facilityId');
        if (!contaminant) {
          return {
            content: [
              {
                type: 'text',
                text: 'Contaminant not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contaminant, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting contaminant: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  list_contaminants: {
    description: 'List all contaminants with optional filters',
    inputSchema: zodToJsonSchema(listContaminantsSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof listContaminantsSchema>) => {
      try {
        const validatedArgs = listContaminantsSchema.parse(args);
        const filter: any = {};
        if (validatedArgs.facilityId) filter.facilityId = validatedArgs.facilityId;
        if (validatedArgs.shipment_id) filter.shipment_id = validatedArgs.shipment_id;
        if (validatedArgs.material) filter.material = { $regex: validatedArgs.material, $options: 'i' };

        const contaminants = await Contaminant.find(filter).populate('facilityId');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contaminants, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error listing contaminants: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  update_contaminant: {
    description: 'Update a contaminant by ID',
    inputSchema: zodToJsonSchema(updateContaminantSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof updateContaminantSchema>) => {
      try {
        const validatedArgs = updateContaminantSchema.parse(args);
        const updateData: any = { ...validatedArgs };
        delete updateData.id;
        if (validatedArgs.detection_time) {
          updateData.detection_time = new Date(validatedArgs.detection_time);
        }

        const contaminant = await Contaminant.findByIdAndUpdate(validatedArgs.id, updateData, { new: true });
        if (!contaminant) {
          return {
            content: [
              {
                type: 'text',
                text: 'Contaminant not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contaminant, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating contaminant: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  delete_contaminant: {
    description: 'Delete a contaminant by ID',
    inputSchema: zodToJsonSchema(deleteContaminantSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof deleteContaminantSchema>) => {
      try {
        const validatedArgs = deleteContaminantSchema.parse(args);
        const contaminant = await Contaminant.findByIdAndDelete(validatedArgs.id);
        if (!contaminant) {
          return {
            content: [
              {
                type: 'text',
                text: 'Contaminant not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Contaminant deleted successfully: ${contaminant.wasteItemDetected}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error deleting contaminant: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};

