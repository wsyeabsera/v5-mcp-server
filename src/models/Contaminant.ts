import mongoose, { Schema, Document } from 'mongoose';

export type LevelType = 'low' | 'medium' | 'high';

export interface IContaminant extends Document {
  wasteItemDetected: string;
  material: string;
  facilityId: mongoose.Types.ObjectId;
  detection_time: Date;
  explosive_level: LevelType;
  hcl_level: LevelType;
  so2_level: LevelType;
  estimated_size: number;
  shipment_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContaminantSchema = new Schema<IContaminant>(
  {
    wasteItemDetected: {
      type: String,
      required: true,
      trim: true,
    },
    material: {
      type: String,
      required: true,
      trim: true,
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    detection_time: {
      type: Date,
      required: true,
    },
    explosive_level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    hcl_level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    so2_level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    estimated_size: {
      type: Number,
      required: true,
    },
    shipment_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Contaminant = mongoose.model<IContaminant>('Contaminant', ContaminantSchema);

