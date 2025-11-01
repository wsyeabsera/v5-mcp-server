import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Inspection } from '../models/index.js';

const wasteTypeSchema = z.object({
  category: z.string().describe('Waste category'),
  percentage: z.string().describe('Percentage'),
});

// Define schemas
const createInspectionSchema = z.object({
  facility_id: z.string().describe('Facility ID'),
  is_delivery_accepted: z.boolean().describe('Is delivery accepted'),
  does_delivery_meets_conditions: z.boolean().describe('Does delivery meet conditions'),
  selected_wastetypes: z.array(wasteTypeSchema).describe('Selected waste types'),
  heating_value_calculation: z.number().describe('Heating value calculation'),
  waste_producer: z.string().describe('Waste producer'),
  contract_reference_id: z.string().describe('Contract reference ID'),
});

const getInspectionSchema = z.object({
  id: z.string().describe('Inspection ID'),
});

const listInspectionsSchema = z.object({
  facility_id: z.string().optional().describe('Filter by facility ID'),
  is_delivery_accepted: z.boolean().optional().describe('Filter by delivery acceptance'),
  contract_reference_id: z.string().optional().describe('Filter by contract reference ID'),
});

const updateInspectionSchema = z.object({
  id: z.string().describe('Inspection ID'),
  is_delivery_accepted: z.boolean().optional().describe('Is delivery accepted'),
  does_delivery_meets_conditions: z.boolean().optional().describe('Does delivery meet conditions'),
  selected_wastetypes: z.array(wasteTypeSchema).optional().describe('Selected waste types'),
  heating_value_calculation: z.number().optional().describe('Heating value calculation'),
  waste_producer: z.string().optional().describe('Waste producer'),
  contract_reference_id: z.string().optional().describe('Contract reference ID'),
});

const deleteInspectionSchema = z.object({
  id: z.string().describe('Inspection ID'),
});

export const inspectionTools = {
  create_inspection: {
    description: 'Create a new inspection',
    inputSchema: zodToJsonSchema(createInspectionSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof createInspectionSchema>) => {
      try {
        const validatedArgs = createInspectionSchema.parse(args);
        const inspection = await Inspection.create(validatedArgs);
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
    inputSchema: zodToJsonSchema(getInspectionSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof getInspectionSchema>) => {
      try {
        const validatedArgs = getInspectionSchema.parse(args);
        const inspection = await Inspection.findById(validatedArgs.id).populate('facility_id');
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
    inputSchema: zodToJsonSchema(listInspectionsSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof listInspectionsSchema>) => {
      try {
        const validatedArgs = listInspectionsSchema.parse(args);
        const filter: any = {};
        if (validatedArgs.facility_id) filter.facility_id = validatedArgs.facility_id;
        if (validatedArgs.is_delivery_accepted !== undefined)
          filter.is_delivery_accepted = validatedArgs.is_delivery_accepted;
        if (validatedArgs.contract_reference_id) filter.contract_reference_id = validatedArgs.contract_reference_id;

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
    inputSchema: zodToJsonSchema(updateInspectionSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof updateInspectionSchema>) => {
      try {
        const validatedArgs = updateInspectionSchema.parse(args);
        const updateData: any = { ...validatedArgs };
        delete updateData.id;

        const inspection = await Inspection.findByIdAndUpdate(validatedArgs.id, updateData, { new: true });
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
    inputSchema: zodToJsonSchema(deleteInspectionSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof deleteInspectionSchema>) => {
      try {
        const validatedArgs = deleteInspectionSchema.parse(args);
        const inspection = await Inspection.findByIdAndDelete(validatedArgs.id);
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
