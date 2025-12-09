import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminClientPage from './AdminClientPage';
import { headers } from 'next/headers';

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return redirect("/auth");
  }

  return (
    <AdminClientPage session={session} />
  );
}
