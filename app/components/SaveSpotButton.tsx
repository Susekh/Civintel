"use client";

import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { useTransition } from "react";
import { useSession } from "@/lib/auth-client";
import { saveSpotAction } from "@/lib/actions/saveSpotAction";

interface SaveSpotButtonProps {
  spotId: string;
  isSaved: boolean;
}

export default function SaveSpotButton({ spotId, isSaved }: SaveSpotButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession(); // ✅ Access session directly

  const handleClick = () => {
    if (!session?.user?.id) {
      toast.error("Please log in to save this spot.");
      return;
    }

    startTransition(async () => {
      const result = await saveSpotAction(spotId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Error while saving!");
      }
    });
  };

  // If no session, show "Login to save"
  if (!session?.user?.id) {
    return <span className="text-sm text-neutral-400">Login to save</span>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="cursor-pointer transition hover:scale-110 disabled:opacity-50"
    >
      <Star
        className={`h-6 w-6 ${
          isSaved ? "fill-white text-yellow-400" : "text-neutral-500"
        }`}
      />
    </button>
  );
}
