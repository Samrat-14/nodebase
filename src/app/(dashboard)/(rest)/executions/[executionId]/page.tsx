import { requireAuth } from '@/lib/auth-utils';

interface ExecutionPageProps {
  params: Promise<{ executionId: string }>;
}

export default async function ExecutionPage({ params }: ExecutionPageProps) {
  await requireAuth();

  const { executionId } = await params;

  return <div>Execution ID: {executionId}</div>;
}
