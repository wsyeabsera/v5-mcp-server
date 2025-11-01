import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Facility } from '../models/index.js';

// Define schemas
const createFacilitySchema = z.object({
  name: z.string().describe('Facility name'),
  shortCode: z.string().describe('Facility short code'),
  location: z.string().describe('Facility location'),
});

const getFacilitySchema = z.object({
  id: z.string().describe('Facility ID'),
});

const listFacilitiesSchema = z.object({
  shortCode: z.string().optional().describe('Filter by short code'),
  location: z.string().optional().describe('Filter by location'),
});

const updateFacilitySchema = z.object({
  id: z.string().describe('Facility ID'),
  name: z.string().optional().describe('Facility name'),
  shortCode: z.string().optional().describe('Facility short code'),
  location: z.string().optional().describe('Facility location'),
});

const deleteFacilitySchema = z.object({
  id: z.string().describe('Facility ID'),
});

export const facilityTools = {
  create_facility: {
    description: 'Create a new facility',
    inputSchema: zodToJsonSchema(createFacilitySchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof createFacilitySchema>) => {
      try {
        const validatedArgs = createFacilitySchema.parse(args);
        const facility = await Facility.create(validatedArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(facility, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating facility: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  get_facility: {
    description: 'Get a facility by ID',
    inputSchema: zodToJsonSchema(getFacilitySchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof getFacilitySchema>) => {
      const validatedArgs = getFacilitySchema.parse(args);
      try {
        const facility = await Facility.findById(validatedArgs.id);
        if (!facility) {
          return {
            content: [
              {
                type: 'text',
                text: 'Facility not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(facility, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting facility: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  list_facilities: {
    description: 'List all facilities with optional filters',
    inputSchema: zodToJsonSchema(listFacilitiesSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof listFacilitiesSchema>) => {
      const validatedArgs = listFacilitiesSchema.parse(args);
      try {
        const filter: any = {};
        if (validatedArgs.shortCode) filter.shortCode = validatedArgs.shortCode;
        if (validatedArgs.location) filter.location = { $regex: validatedArgs.location, $options: 'i' };

        const facilities = await Facility.find(filter);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(facilities, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error listing facilities: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  update_facility: {
    description: 'Update a facility by ID',
    inputSchema: zodToJsonSchema(updateFacilitySchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof updateFacilitySchema>) => {
      const validatedArgs = updateFacilitySchema.parse(args);
      try {
        const updateData: any = {};
        if (validatedArgs.name) updateData.name = validatedArgs.name;
        if (validatedArgs.shortCode) updateData.shortCode = validatedArgs.shortCode;
        if (validatedArgs.location) updateData.location = validatedArgs.location;

        const facility = await Facility.findByIdAndUpdate(validatedArgs.id, updateData, { new: true });
        if (!facility) {
          return {
            content: [
              {
                type: 'text',
                text: 'Facility not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(facility, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating facility: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  delete_facility: {
    description: 'Delete a facility by ID',
    inputSchema: zodToJsonSchema(deleteFacilitySchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof deleteFacilitySchema>) => {
      const validatedArgs = deleteFacilitySchema.parse(args);
      try {
        const facility = await Facility.findByIdAndDelete(validatedArgs.id);
        if (!facility) {
          return {
            content: [
              {
                type: 'text',
                text: 'Facility not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Facility deleted successfully: ${facility.name}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error deleting facility: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};

