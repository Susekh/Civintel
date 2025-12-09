import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import paymentModel from "@/lib/db/payment.model";
import { connectDB } from "@/lib/dbConnect";

if (!process.env.NEXT_PUBLIC_RAZOR_KEY_ID || !process.env.NEXT_PUBLIC_RAZOR_KEY_SECRET) {
  throw new Error("❌ Razorpay environment variables missing");
}

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZOR_KEY_ID,
  key_secret: process.env.NEXT_PUBLIC_RAZOR_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID missing" }, { status: 400 });
    }

    // CHECKING IF USER ALREADY HAS A PENDING ORDER
    const existingOrder = await paymentModel.findOne({
      userId,
      status: "PENDING",
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        message: "Existing pending order found",
        orderId: existingOrder.razorpay_order_id,
        amount: existingOrder.amount,
      });
    }

    //Creating new Razorpay order
    const razorAmount = 300 * 100; 

    const order = await razorpay.orders.create({
      amount: razorAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    //  Saving in DB
    await paymentModel.create({
      userId,
      amount : 300,
      currency: "INR",
      razorpay_order_id: order.id,
      status: "PENDING",
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount : 300,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { success: false, message: "Order creation failed" },
      { status: 500 }
    );
  }
}
