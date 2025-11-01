import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  shortCode: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Facility = mongoose.model<IFacility>('Facility', FacilitySchema);

