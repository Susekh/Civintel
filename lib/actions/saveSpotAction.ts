"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function saveSpotAction(spotId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/spots/save/${spotId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to save" };

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error in saveSpotAction:", error);
    return { success: false, error: "Unexpected error" };
  }
}
