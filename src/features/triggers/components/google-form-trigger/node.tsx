'use client';

import { memo, useState } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseTriggerNode } from '@/features/triggers/components/base-trigger-node';
import { GoogleFormTriggerDialog } from '@/features/triggers/components/google-form-trigger/dialog';
import { useNodeStatus } from '@/features/executions/hooks/use-node-status';
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from '@/inngest/channels/google-form-trigger';
import { fetchGoogleFormTriggerRealtimeToken } from '@/features/triggers/components/google-form-trigger/actions';

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchGoogleFormTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon="/logos/googleform.svg"
        name="Google Form"
        description="When form is submitted"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GoogleFormTriggerNode.displayName = 'GoogleFormTriggerNode';
