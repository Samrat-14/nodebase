'use client';

import { memo, useState } from 'react';
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { BaseExecutionNode } from '@/features/executions/components/base-execution-node';
import { useNodeStatus } from '@/features/executions/hooks/use-node-status';
import {
  AVAILABLE_MODELS,
  OpenAiDialog,
  type OpenAiFormValues,
} from '@/features/executions/components/openai/dialog';
import { OPENAI_CHANNEL_NAME } from '@/inngest/channels/openai';
import { fetchOpenAiRealtimeToken } from '@/features/executions/components/openai/actions';

type OpenAiNodeData = {
  variableName?: string;
  credentialId?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchOpenAiRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: OpenAiFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}...`
    : 'Not configured';

  return (
    <>
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        status={nodeStatus}
        name="OpenAI"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

OpenAiNode.displayName = 'OpenAiNode';
