"use server";

import { auth } from "@/lib/auth";
import { UserProfileModel } from "@/lib/db/userProfile.model";
import { headers } from "next/headers";

export async function getIsPro() {
  try {
    const session = await auth.api.getSession({headers : await headers()});

    if (!session || !session.user?.id) {
      return { isPro: false, error: "Unauthorized" };
    }

    const user = await UserProfileModel.findOne({ userId: session.user.id })
      .select("isPro");

    if (!user) {
      return { isPro: false, error: "User profile not found" };
    }

    return { isPro: user.isPro };
  } catch (err) {
    console.error("Error getting isPro:", err);
    return { isPro: false, error: "Internal server error" };
  }
}
