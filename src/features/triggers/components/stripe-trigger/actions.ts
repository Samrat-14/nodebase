'use server';

import type { Realtime } from 'inngest';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';
import { stripeTriggerChannel } from '@/inngest/channels/stripe-trigger';

export type StripeTriggerToken = Realtime.Subscribe.ClientToken;

export async function fetchStripeTriggerRealtimeToken(): Promise<StripeTriggerToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: stripeTriggerChannel,
    topics: ['status'],
  });

  return token;
}
