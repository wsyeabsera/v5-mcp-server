import { z } from 'zod';
import { Facility } from '../models/index.js';

export const facilityTools = {
  create_facility: {
    description: 'Create a new facility',
    inputSchema: z.object({
      name: z.string().describe('Facility name'),
      shortCode: z.string().describe('Facility short code'),
      location: z.string().describe('Facility location'),
    }),
    handler: async (args: { name: string; shortCode: string; location: string }) => {
      try {
        const facility = await Facility.create(args);
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
    inputSchema: z.object({
      id: z.string().describe('Facility ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const facility = await Facility.findById(args.id);
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
    inputSchema: z.object({
      shortCode: z.string().optional().describe('Filter by short code'),
      location: z.string().optional().describe('Filter by location'),
    }),
    handler: async (args: { shortCode?: string; location?: string }) => {
      try {
        const filter: any = {};
        if (args.shortCode) filter.shortCode = args.shortCode;
        if (args.location) filter.location = { $regex: args.location, $options: 'i' };

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
    inputSchema: z.object({
      id: z.string().describe('Facility ID'),
      name: z.string().optional().describe('Facility name'),
      shortCode: z.string().optional().describe('Facility short code'),
      location: z.string().optional().describe('Facility location'),
    }),
    handler: async (args: { id: string; name?: string; shortCode?: string; location?: string }) => {
      try {
        const updateData: any = {};
        if (args.name) updateData.name = args.name;
        if (args.shortCode) updateData.shortCode = args.shortCode;
        if (args.location) updateData.location = args.location;

        const facility = await Facility.findByIdAndUpdate(args.id, updateData, { new: true });
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
    inputSchema: z.object({
      id: z.string().describe('Facility ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const facility = await Facility.findByIdAndDelete(args.id);
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

