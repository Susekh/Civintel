import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  amount: number;
  currency: string;
  userId: mongoose.Types.ObjectId;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  status: "PENDING" | "PAID" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);


const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
