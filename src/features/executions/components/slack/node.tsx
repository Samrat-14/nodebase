'use client';

import { memo, useState } from 'react';
import { useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { BaseExecutionNode } from '@/features/executions/components/base-execution-node';
import { useNodeStatus } from '@/features/executions/hooks/use-node-status';
import { SlackDialog, type SlackFormValues } from '@/features/executions/components/slack/dialog';
import { SLACK_CHANNEL_NAME } from '@/inngest/channels/slack';
import { fetchSlackRealtimeToken } from '@/features/executions/components/slack/actions';

type SlackNodeData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: SLACK_CHANNEL_NAME,
    topic: 'status',
    refreshToken: fetchSlackRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: SlackFormValues) => {
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
  const description = nodeData?.content
    ? `Send: ${nodeData.content.slice(0, 50)}...`
    : 'Not configured';

  return (
    <>
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/slack.svg"
        status={nodeStatus}
        name="Slack"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

SlackNode.displayName = 'SlackNode';
