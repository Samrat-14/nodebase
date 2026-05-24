import { useEffect, useState } from 'react';
import { useRealtime } from 'inngest/react';
import type { Realtime } from 'inngest';
import type { NodeStatus } from '@/components/react-flow/node-status-indicator';

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.ClientToken>;
}

export const useNodeStatus = ({ nodeId, channel, topic, refreshToken }: UseNodeStatusOptions) => {
  const [status, setStatus] = useState<NodeStatus>('initial');

  const { messages } = useRealtime({
    channel,
    topics: [topic],
    token: refreshToken,
    enabled: true,
  });

  useEffect(() => {
    if (!messages.all.length) {
      return;
    }

    // Find latest message for this node
    const latestMessage = messages.all
      .filter(
        (msg) =>
          msg.kind === 'data' &&
          // msg.channel === channel.name &&
          msg.channel === channel &&
          msg.topic === topic &&
          (msg.data as any).nodeId === nodeId,
      )
      .sort((a, b) => {
        if (a.kind === 'data' && b.kind === 'data') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      })[0];

    if (latestMessage?.kind === 'data') {
      setStatus((latestMessage.data as any).status as NodeStatus);
    }
  }, [messages, nodeId, channel, topic]);

  return status;
};
