'use server';

import type { Realtime } from 'inngest';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';
import { manualTriggerChannel } from '@/inngest/channels/manual-trigger';

export type ManualTriggerToken = Realtime.Subscribe.ClientToken;

export async function fetchManualTriggerRealtimeToken(): Promise<ManualTriggerToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: manualTriggerChannel,
    topics: ['status'],
  });

  return token;
}
