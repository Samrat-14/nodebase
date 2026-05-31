import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth-utils';
import { ExecutionView } from '@/features/executions/components/execution';
import { prefetchExecution } from '@/features/executions/server/prefetch';
import { HydrateClient } from '@/trpc/server';
import { ErrorBoundary } from 'react-error-boundary';
import { ExecutionsError, ExecutionsLoading } from '@/features/executions/components/executions';

interface ExecutionPageProps {
  params: Promise<{ executionId: string }>;
}

export default async function ExecutionPage({ params }: ExecutionPageProps) {
  await requireAuth();

  const { executionId } = await params;
  prefetchExecution(executionId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-6xl w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionsError />}>
            <Suspense fallback={<ExecutionsLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
}
