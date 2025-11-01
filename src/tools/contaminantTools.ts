import { z } from 'zod';
import { Contaminant } from '../models/index.js';

const levelEnum = z.enum(['low', 'medium', 'high']);

export const contaminantTools = {
  create_contaminant: {
    description: 'Create a new contaminant record',
    inputSchema: z.object({
      wasteItemDetected: z.string().describe('Waste item detected'),
      material: z.string().describe('Material type'),
      facilityId: z.string().describe('Facility ID'),
      detection_time: z.string().describe('Detection time (ISO 8601 format)'),
      explosive_level: levelEnum.describe('Explosive level'),
      hcl_level: levelEnum.describe('HCl level'),
      so2_level: levelEnum.describe('SO2 level'),
      estimated_size: z.number().describe('Estimated size'),
      shipment_id: z.string().describe('Shipment ID'),
    }),
    handler: async (args: {
      wasteItemDetected: string;
      material: string;
      facilityId: string;
      detection_time: string;
      explosive_level: string;
      hcl_level: string;
      so2_level: string;
      estimated_size: number;
      shipment_id: string;
    }) => {
      try {
        const contaminant = await Contaminant.create({
          ...args,
          detection_time: new Date(args.detection_time),
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
    inputSchema: z.object({
      id: z.string().describe('Contaminant ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const contaminant = await Contaminant.findById(args.id).populate('facilityId');
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
    inputSchema: z.object({
      facilityId: z.string().optional().describe('Filter by facility ID'),
      shipment_id: z.string().optional().describe('Filter by shipment ID'),
      material: z.string().optional().describe('Filter by material'),
    }),
    handler: async (args: { facilityId?: string; shipment_id?: string; material?: string }) => {
      try {
        const filter: any = {};
        if (args.facilityId) filter.facilityId = args.facilityId;
        if (args.shipment_id) filter.shipment_id = args.shipment_id;
        if (args.material) filter.material = { $regex: args.material, $options: 'i' };

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
    inputSchema: z.object({
      id: z.string().describe('Contaminant ID'),
      wasteItemDetected: z.string().optional().describe('Waste item detected'),
      material: z.string().optional().describe('Material type'),
      detection_time: z.string().optional().describe('Detection time (ISO 8601 format)'),
      explosive_level: levelEnum.optional().describe('Explosive level'),
      hcl_level: levelEnum.optional().describe('HCl level'),
      so2_level: levelEnum.optional().describe('SO2 level'),
      estimated_size: z.number().optional().describe('Estimated size'),
      shipment_id: z.string().optional().describe('Shipment ID'),
    }),
    handler: async (args: any) => {
      try {
        const updateData: any = { ...args };
        delete updateData.id;
        if (args.detection_time) {
          updateData.detection_time = new Date(args.detection_time);
        }

        const contaminant = await Contaminant.findByIdAndUpdate(args.id, updateData, { new: true });
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
    inputSchema: z.object({
      id: z.string().describe('Contaminant ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const contaminant = await Contaminant.findByIdAndDelete(args.id);
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

