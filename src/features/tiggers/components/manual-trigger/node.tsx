'use client';

import { BaseTriggerNode } from '@/features/tiggers/components/base-trigger-node';
import type { NodeProps } from '@xyflow/react';
import { GlobeIcon } from 'lucide-react';
import { memo } from 'react';

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={GlobeIcon}
        name="When clicking 'Execute workflow'"
        // status={nodeStatus}
        // onSettings={handleOpenSettings}
        // onDoubleClick={handleOpenSettings}
      ></BaseTriggerNode>
    </>
  );
});

ManualTriggerNode.displayName = 'ManualTriggerNode';
