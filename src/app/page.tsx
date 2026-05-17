import { LogoutButton } from '@/app/logout';
import { requireAuth } from '@/lib/auth-utils';
import { caller } from '@/trpc/server';

export default async function RootPage() {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center gap-y-6">
      protected server component
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <LogoutButton />
    </div>
  );
}
