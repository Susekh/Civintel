import mongoose, { Schema, Document } from "mongoose";

export interface IPrice extends Document {
  amount: number;
  updatedAt: Date;
}

const PriceSchema = new Schema<IPrice>(
  {
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Price || mongoose.model<IPrice>("Price", PriceSchema);
