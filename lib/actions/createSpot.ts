"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createSpotAction(formData: FormData) {
  try {
    const title = String(formData.get("title") || "");
    const description = String(formData.get("description") || "");
    const tagsString = String(formData.get("tags") || "");
    const lat = Number(formData.get("lat"));
    const lng = Number(formData.get("lng"));

    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const gallery = formData.getAll("gallery[]") as string[];

    if (!title || !description || isNaN(lat) || isNaN(lng)) {
      throw new Error("Missing required fields");
    }

    const cookieStore = await cookies();

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/spots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore.toString(),
      },
      body: JSON.stringify({
        title,
        description,
        tags,
        location: { lat, lng },
        gallery,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Failed to create spot: ${res.status} ${res.statusText} → ${errText}`
      );
    }

    revalidatePath("/spots");

  } catch (error) {
    console.error("Create spot error:", error);
    throw error;
  }
}
