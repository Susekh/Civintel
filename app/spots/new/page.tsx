import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateSpotForm from "@/app/components/CreateSpotForm";
import { headers } from "next/headers";
import { createSpotAction } from "@/lib/actions/createSpot";

export default async function NewSpotPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth");
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl fon5t-semibold mb-4">Create a new Report</h1>
      <CreateSpotForm action={createSpotAction} />
    </div>
  );
}
