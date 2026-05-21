'use client';

import { BaseTriggerNode } from '@/features/triggers/components/base-trigger-node';
import { ManualTriggerDialog } from '@/features/triggers/components/manual-trigger/dialog';
import type { NodeProps } from '@xyflow/react';
import { MousePointerIcon } from 'lucide-react';
import { memo, useState } from 'react';

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = 'initial';

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ManualTriggerNode.displayName = 'ManualTriggerNode';
