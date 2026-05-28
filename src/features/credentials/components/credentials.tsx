'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import type { Credential } from '@/generated/prisma/client';
import { CredentialType } from '@/generated/prisma/enums';
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from '@/components/entity-components';
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from '@/features/credentials/hooks/use-credentials';
import { useCredentialsParams } from '@/features/credentials/hooks/use-credentials-params';
import { useEntitySearch } from '@/hooks/use-entity-search';

export function CredentialsSearch() {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({ params, setParams });

  return (
    <EntitySearch value={searchValue} onChange={onSearchChange} placeholder="Search credentials" />
  );
}

export function CredentialsList() {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialsItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
}

export function CredentialsHeader({ disabled }: { disabled?: boolean }) {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonHref="/credentials/new"
      newButtonLabel="New credential"
      disabled={disabled}
    />
  );
}

export function CredentialsPagination() {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}

export function CredentialsContainer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EntityContainer
        header={<CredentialsHeader />}
        search={<CredentialsSearch />}
        pagination={<CredentialsPagination />}
      >
        {children}
      </EntityContainer>
    </>
  );
}

export function CredentialsLoading() {
  return <LoadingView message="Loading credentials..." />;
}

export function CredentialsError() {
  return <ErrorView message="Error loading credentials" />;
}

export function CredentialsEmpty() {
  const router = useRouter();

  const handleCreate = () => {
    router.push('/credentials/new');
  };

  return (
    <>
      <EmptyView
        onNew={handleCreate}
        message="No credentials found. Get started by creating a credential"
      />
    </>
  );
}

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: '/logos/openai.svg',
  [CredentialType.GEMINI]: '/logos/gemini.svg',
  [CredentialType.ANTHROPIC]: '/logos/anthropic.svg',
};

export function CredentialsItem({ data }: { data: Credential }) {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  const logo = credentialLogos[data.type];

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })} &bull; Created{' '}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} height={20} width={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
}
