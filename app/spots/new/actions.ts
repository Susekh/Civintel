"use server"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSpot(formData: FormData) {
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const tagsRaw = String(formData.get("tags") || "");
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/spots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: cookies().toString(), // forward Better Auth cookies
    },
    body: JSON.stringify({ title, description, tags, location: { lat, lng } }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create spot: ${res.status} ${res.statusText} → ${errText}`);
  }

  const { spot } = await res.json();
  redirect(`/spots/${spot._id}`);
}
