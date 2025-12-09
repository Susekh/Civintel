import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PaymentClient from "./PaymentClient";

export default async function Payment() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/users/${session.user.id}`,
    {
      headers: Object.fromEntries(await headers()),
      cache: "no-store",
    }
  );

  const userProfile = await res.json();

  if (userProfile.user?.isPro) {
    redirect("/dashboard");
  }

  return <PaymentClient userId={session.user.id} />;
}
