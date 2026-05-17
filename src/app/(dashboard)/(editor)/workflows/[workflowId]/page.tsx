import { requireAuth } from '@/lib/auth-utils';

interface WorkflowPageProps {
  params: Promise<{ workflowId: string }>;
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  await requireAuth();

  const { workflowId } = await params;

  return <div>Workflow ID: {workflowId}</div>;
}
