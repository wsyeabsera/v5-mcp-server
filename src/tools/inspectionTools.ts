import { z } from 'zod';
import { Inspection } from '../models/index.js';

const wasteTypeSchema = z.object({
  category: z.string().describe('Waste category'),
  percentage: z.string().describe('Percentage'),
});

export const inspectionTools = {
  create_inspection: {
    description: 'Create a new inspection',
    inputSchema: z.object({
      facility_id: z.string().describe('Facility ID'),
      is_delivery_accepted: z.boolean().describe('Is delivery accepted'),
      does_delivery_meets_conditions: z.boolean().describe('Does delivery meet conditions'),
      selected_wastetypes: z.array(wasteTypeSchema).describe('Selected waste types'),
      heating_value_calculation: z.number().describe('Heating value calculation'),
      waste_producer: z.string().describe('Waste producer'),
      contract_reference_id: z.string().describe('Contract reference ID'),
    }),
    handler: async (args: {
      facility_id: string;
      is_delivery_accepted: boolean;
      does_delivery_meets_conditions: boolean;
      selected_wastetypes: Array<{ category: string; percentage: string }>;
      heating_value_calculation: number;
      waste_producer: string;
      contract_reference_id: string;
    }) => {
      try {
        const inspection = await Inspection.create(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(inspection, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating inspection: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  get_inspection: {
    description: 'Get an inspection by ID',
    inputSchema: z.object({
      id: z.string().describe('Inspection ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const inspection = await Inspection.findById(args.id).populate('facility_id');
        if (!inspection) {
          return {
            content: [
              {
                type: 'text',
                text: 'Inspection not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(inspection, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting inspection: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  list_inspections: {
    description: 'List all inspections with optional filters',
    inputSchema: z.object({
      facility_id: z.string().optional().describe('Filter by facility ID'),
      is_delivery_accepted: z.boolean().optional().describe('Filter by delivery acceptance'),
      contract_reference_id: z.string().optional().describe('Filter by contract reference ID'),
    }),
    handler: async (args: {
      facility_id?: string;
      is_delivery_accepted?: boolean;
      contract_reference_id?: string;
    }) => {
      try {
        const filter: any = {};
        if (args.facility_id) filter.facility_id = args.facility_id;
        if (args.is_delivery_accepted !== undefined)
          filter.is_delivery_accepted = args.is_delivery_accepted;
        if (args.contract_reference_id) filter.contract_reference_id = args.contract_reference_id;

        const inspections = await Inspection.find(filter).populate('facility_id');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(inspections, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error listing inspections: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  update_inspection: {
    description: 'Update an inspection by ID',
    inputSchema: z.object({
      id: z.string().describe('Inspection ID'),
      is_delivery_accepted: z.boolean().optional().describe('Is delivery accepted'),
      does_delivery_meets_conditions: z.boolean().optional().describe('Does delivery meet conditions'),
      selected_wastetypes: z.array(wasteTypeSchema).optional().describe('Selected waste types'),
      heating_value_calculation: z.number().optional().describe('Heating value calculation'),
      waste_producer: z.string().optional().describe('Waste producer'),
      contract_reference_id: z.string().optional().describe('Contract reference ID'),
    }),
    handler: async (args: any) => {
      try {
        const updateData: any = { ...args };
        delete updateData.id;

        const inspection = await Inspection.findByIdAndUpdate(args.id, updateData, { new: true });
        if (!inspection) {
          return {
            content: [
              {
                type: 'text',
                text: 'Inspection not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(inspection, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating inspection: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  delete_inspection: {
    description: 'Delete an inspection by ID',
    inputSchema: z.object({
      id: z.string().describe('Inspection ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const inspection = await Inspection.findByIdAndDelete(args.id);
        if (!inspection) {
          return {
            content: [
              {
                type: 'text',
                text: 'Inspection not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Inspection deleted successfully`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error deleting inspection: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};

