import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
  entry_timestamp: Date;
  exit_timestamp: Date;
  source: string;
  facilityId: mongoose.Types.ObjectId;
  license_plate: string;
  contract_reference_id: string;
  contractId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    entry_timestamp: {
      type: Date,
      required: true,
    },
    exit_timestamp: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    license_plate: {
      type: String,
      required: true,
      trim: true,
    },
    contract_reference_id: {
      type: String,
      required: true,
      trim: true,
    },
    contractId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shipment = mongoose.model<IShipment>('Shipment', ShipmentSchema);

