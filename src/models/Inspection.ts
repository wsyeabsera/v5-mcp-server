import mongoose, { Schema, Document } from 'mongoose';

export interface IWasteType {
  category: string;
  percentage: string;
}

export interface IInspection extends Document {
  facility_id: mongoose.Types.ObjectId;
  is_delivery_accepted: boolean;
  does_delivery_meets_conditions: boolean;
  selected_wastetypes: IWasteType[];
  heating_value_calculation: number;
  waste_producer: string;
  contract_reference_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const WasteTypeSchema = new Schema<IWasteType>(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    percentage: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const InspectionSchema = new Schema<IInspection>(
  {
    facility_id: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    is_delivery_accepted: {
      type: Boolean,
      required: true,
    },
    does_delivery_meets_conditions: {
      type: Boolean,
      required: true,
    },
    selected_wastetypes: {
      type: [WasteTypeSchema],
      required: true,
      default: [],
    },
    heating_value_calculation: {
      type: Number,
      required: true,
    },
    waste_producer: {
      type: String,
      required: true,
      trim: true,
    },
    contract_reference_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Inspection = mongoose.model<IInspection>('Inspection', InspectionSchema);

