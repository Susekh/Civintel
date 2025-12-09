import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/dbConnect";
import paymentModel from "@/lib/db/payment.model";
import { UserProfileModel } from "@/lib/db/userProfile.model";

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function POST(req: Request) {
  await connectDB();
  const body = (await req.json()) as VerifyBody;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.NEXT_PUBLIC_RAZOR_KEY_SECRET as string)
    .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== body.razorpay_signature) {
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 400 }
    );
  }

  const payment = await paymentModel.findOneAndUpdate(
    { razorpay_order_id: body.razorpay_order_id },
    {
      razorpay_payment_id: body.razorpay_payment_id,
      razorpay_signature: body.razorpay_signature,
      status: "PAID",
    },
    { new: true }
  );

  if (!payment) {
    return NextResponse.json(
      { success: false, message: "Payment record not found" },
      { status: 404 }
    );
  }

  await UserProfileModel.findOneAndUpdate(
      { userId: payment.userId },
      { isPro: true }
    );

  return NextResponse.json({ success: true, upgraded: true });
}
