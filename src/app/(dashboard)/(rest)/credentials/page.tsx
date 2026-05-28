import type { SearchParams } from 'nuqs';
import { requireAuth } from '@/lib/auth-utils';
import { credentialsParamsLoader } from '@/features/credentials/server/params-loader';
import { prefetchCredentials } from '@/features/credentials/server/prefetch';
import { HydrateClient } from '@/trpc/server';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import {
  CredentialsContainer,
  CredentialsError,
  CredentialsList,
  CredentialsLoading,
} from '@/features/credentials/components/credentials';

type CredentialsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CredentialsPage({ searchParams }: CredentialsPageProps) {
  await requireAuth();

  const params = await credentialsParamsLoader(searchParams);
  prefetchCredentials(params);

  return (
    <CredentialsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<CredentialsError />}>
          <Suspense fallback={<CredentialsLoading />}>
            <CredentialsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </CredentialsContainer>
  );
}
