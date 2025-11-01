import { z } from 'zod';
import { Shipment } from '../models/index.js';

export const shipmentTools = {
  create_shipment: {
    description: 'Create a new shipment',
    inputSchema: z.object({
      entry_timestamp: z.string().describe('Entry timestamp (ISO 8601 format)'),
      exit_timestamp: z.string().describe('Exit timestamp (ISO 8601 format)'),
      source: z.string().describe('Shipment source'),
      facilityId: z.string().describe('Facility ID'),
      license_plate: z.string().describe('License plate'),
      contract_reference_id: z.string().describe('Contract reference ID'),
      contractId: z.string().describe('Contract ID'),
    }),
    handler: async (args: {
      entry_timestamp: string;
      exit_timestamp: string;
      source: string;
      facilityId: string;
      license_plate: string;
      contract_reference_id: string;
      contractId: string;
    }) => {
      try {
        const shipment = await Shipment.create({
          ...args,
          entry_timestamp: new Date(args.entry_timestamp),
          exit_timestamp: new Date(args.exit_timestamp),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(shipment, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating shipment: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  get_shipment: {
    description: 'Get a shipment by ID',
    inputSchema: z.object({
      id: z.string().describe('Shipment ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const shipment = await Shipment.findById(args.id).populate('facilityId');
        if (!shipment) {
          return {
            content: [
              {
                type: 'text',
                text: 'Shipment not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(shipment, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting shipment: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  list_shipments: {
    description: 'List all shipments with optional filters',
    inputSchema: z.object({
      facilityId: z.string().optional().describe('Filter by facility ID'),
      contractId: z.string().optional().describe('Filter by contract ID'),
      license_plate: z.string().optional().describe('Filter by license plate'),
      source: z.string().optional().describe('Filter by source'),
    }),
    handler: async (args: {
      facilityId?: string;
      contractId?: string;
      license_plate?: string;
      source?: string;
    }) => {
      try {
        const filter: any = {};
        if (args.facilityId) filter.facilityId = args.facilityId;
        if (args.contractId) filter.contractId = args.contractId;
        if (args.license_plate) filter.license_plate = args.license_plate;
        if (args.source) filter.source = { $regex: args.source, $options: 'i' };

        const shipments = await Shipment.find(filter).populate('facilityId');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(shipments, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error listing shipments: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  update_shipment: {
    description: 'Update a shipment by ID',
    inputSchema: z.object({
      id: z.string().describe('Shipment ID'),
      entry_timestamp: z.string().optional().describe('Entry timestamp (ISO 8601 format)'),
      exit_timestamp: z.string().optional().describe('Exit timestamp (ISO 8601 format)'),
      source: z.string().optional().describe('Shipment source'),
      license_plate: z.string().optional().describe('License plate'),
      contract_reference_id: z.string().optional().describe('Contract reference ID'),
      contractId: z.string().optional().describe('Contract ID'),
    }),
    handler: async (args: any) => {
      try {
        const updateData: any = { ...args };
        delete updateData.id;
        if (args.entry_timestamp) {
          updateData.entry_timestamp = new Date(args.entry_timestamp);
        }
        if (args.exit_timestamp) {
          updateData.exit_timestamp = new Date(args.exit_timestamp);
        }

        const shipment = await Shipment.findByIdAndUpdate(args.id, updateData, { new: true });
        if (!shipment) {
          return {
            content: [
              {
                type: 'text',
                text: 'Shipment not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(shipment, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error updating shipment: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  delete_shipment: {
    description: 'Delete a shipment by ID',
    inputSchema: z.object({
      id: z.string().describe('Shipment ID'),
    }),
    handler: async (args: { id: string }) => {
      try {
        const shipment = await Shipment.findByIdAndDelete(args.id);
        if (!shipment) {
          return {
            content: [
              {
                type: 'text',
                text: 'Shipment not found',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Shipment deleted successfully: ${shipment.license_plate}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error deleting shipment: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};

