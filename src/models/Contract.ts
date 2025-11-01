import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  producerName: string;
  debitorName: string;
  wasteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    producerName: {
      type: String,
      required: true,
      trim: true,
    },
    debitorName: {
      type: String,
      required: true,
      trim: true,
    },
    wasteCode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);

