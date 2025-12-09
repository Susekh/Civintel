"use client";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useState, useCallback } from "react";
import { Crown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface PaymentClientProps {
  userId: string;
}

export default function PaymentClient({ userId }: PaymentClientProps) {
  const [loading, setLoading] = useState(false);

  const createOrder = useCallback(async () => {
    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) return toast.error("Failed to load Razorpay");

      const res = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      
      if (!res.ok) return toast.error("Order creation failed");

      const data = await res.json();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZOR_KEY_ID!,
        amount: data.amount,
        currency: "INR",
        name: "SpotMate",
        description: "Pro Subscription",
        order_id: data.orderId,
        handler: async (response) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const result = await verifyRes.json();
          toast(result.success ? "✅ Payment Successful!" : "❌ Verification Failed");
          if (result.success) window.location.href = "/dashboard";
        },
      };

      new window.Razorpay(options).open();
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return (
    <div className=" bg-black flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">Civintel Pro</h2>
          <p className="text-zinc-400 text-sm text-center mb-6">Unlock premium features</p>

          {/* Price */}
          <div className="bg-zinc-800 rounded-lg p-4 mb-6 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-white">₹300</span>
              <span className="text-zinc-400 text-sm">/lifetime</span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={createOrder}
            disabled={loading}
            className="w-full cursor-pointer bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-purple-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Upgrade Now</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-zinc-500 text-xs text-center mt-4">
            Secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}