import type { NodeExecutor } from '@/features/executions/types';
import { stripeTriggerChannel } from '@/inngest/channels/stripe-trigger';

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish('loading:stripe-trigger', stripeTriggerChannel.status, {
    nodeId,
    status: 'loading',
  });

  const result = await step.run('stripe-trigger', async () => context);

  await step.realtime.publish('success:stripe-trigger', stripeTriggerChannel.status, {
    nodeId,
    status: 'success',
  });

  return result;
};
