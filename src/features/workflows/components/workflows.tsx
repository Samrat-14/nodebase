'use client';

import { useRouter } from 'next/navigation';
import { EntityContainer, EntityHeader } from '@/components/entity-components';
import { useCreateWorkflow, useSuspenseWorkflows } from '@/features/workflows/hooks/use-workflows';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';

export function WorkflowsList() {
  const workflows = useSuspenseWorkflows();

  return (
    <div className="flex-1 flex justify-center items-center">
      <pre>{JSON.stringify(workflows.data, null, 2)}</pre>
    </div>
  );
}

export function WorkflowsHeader({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
}

export function WorkflowsContainer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EntityContainer header={<WorkflowsHeader />} search={<></>} pagination={<></>}>
        {children}
      </EntityContainer>
    </>
  );
}
