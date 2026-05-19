import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { SearchParams } from 'nuqs/server';
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import { WorkflowsContainer, WorkflowsList } from '@/features/workflows/components/workflows';
import { prefetchWorkflows } from '@/features/workflows/server/prefetch';
import { workflowsParamsLoader } from '@/features/workflows/server/params-loader';

type WorkflowsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function WorkflowsPage({ searchParams }: WorkflowsPageProps) {
  await requireAuth();

  const params = await workflowsParamsLoader(searchParams);
  prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<p>Error!</p>}>
          <Suspense fallback={<p>Loading...</p>}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
}
