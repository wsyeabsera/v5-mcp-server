import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Shipment } from '../models/index.js';

// Define schemas
const createShipmentSchema = z.object({
  entry_timestamp: z.string().describe('Entry timestamp (ISO 8601 format)'),
  exit_timestamp: z.string().describe('Exit timestamp (ISO 8601 format)'),
  source: z.string().describe('Shipment source'),
  facilityId: z.string().describe('Facility ID'),
  license_plate: z.string().describe('License plate'),
  contract_reference_id: z.string().describe('Contract reference ID'),
  contractId: z.string().describe('Contract ID'),
});

const getShipmentSchema = z.object({
  id: z.string().describe('Shipment ID'),
});

const listShipmentsSchema = z.object({
  facilityId: z.string().optional().describe('Filter by facility ID'),
  contractId: z.string().optional().describe('Filter by contract ID'),
  license_plate: z.string().optional().describe('Filter by license plate'),
  source: z.string().optional().describe('Filter by source'),
});

const updateShipmentSchema = z.object({
  id: z.string().describe('Shipment ID'),
  entry_timestamp: z.string().optional().describe('Entry timestamp (ISO 8601 format)'),
  exit_timestamp: z.string().optional().describe('Exit timestamp (ISO 8601 format)'),
  source: z.string().optional().describe('Shipment source'),
  license_plate: z.string().optional().describe('License plate'),
  contract_reference_id: z.string().optional().describe('Contract reference ID'),
  contractId: z.string().optional().describe('Contract ID'),
});

const deleteShipmentSchema = z.object({
  id: z.string().describe('Shipment ID'),
});

export const shipmentTools = {
  create_shipment: {
    description: 'Create a new shipment',
    inputSchema: zodToJsonSchema(createShipmentSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof createShipmentSchema>) => {
      try {
        const validatedArgs = createShipmentSchema.parse(args);
        const shipment = await Shipment.create({
          ...validatedArgs,
          entry_timestamp: new Date(validatedArgs.entry_timestamp),
          exit_timestamp: new Date(validatedArgs.exit_timestamp),
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
    inputSchema: zodToJsonSchema(getShipmentSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof getShipmentSchema>) => {
      try {
        const validatedArgs = getShipmentSchema.parse(args);
        const shipment = await Shipment.findById(validatedArgs.id).populate('facilityId');
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
    inputSchema: zodToJsonSchema(listShipmentsSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof listShipmentsSchema>) => {
      try {
        const validatedArgs = listShipmentsSchema.parse(args);
        const filter: any = {};
        if (validatedArgs.facilityId) filter.facilityId = validatedArgs.facilityId;
        if (validatedArgs.contractId) filter.contractId = validatedArgs.contractId;
        if (validatedArgs.license_plate) filter.license_plate = validatedArgs.license_plate;
        if (validatedArgs.source) filter.source = { $regex: validatedArgs.source, $options: 'i' };

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
    inputSchema: zodToJsonSchema(updateShipmentSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof updateShipmentSchema>) => {
      try {
        const validatedArgs = updateShipmentSchema.parse(args);
        const updateData: any = { ...validatedArgs };
        delete updateData.id;
        if (validatedArgs.entry_timestamp) {
          updateData.entry_timestamp = new Date(validatedArgs.entry_timestamp);
        }
        if (validatedArgs.exit_timestamp) {
          updateData.exit_timestamp = new Date(validatedArgs.exit_timestamp);
        }

        const shipment = await Shipment.findByIdAndUpdate(validatedArgs.id, updateData, { new: true });
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
    inputSchema: zodToJsonSchema(deleteShipmentSchema, { $refStrategy: 'none' }),
    handler: async (args: z.infer<typeof deleteShipmentSchema>) => {
      try {
        const validatedArgs = deleteShipmentSchema.parse(args);
        const shipment = await Shipment.findByIdAndDelete(validatedArgs.id);
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
