'use server';

import type { Realtime } from 'inngest';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';
import { anthropicChannel } from '@/inngest/channels/anthropic';

export type AnthropicToken = Realtime.Subscribe.ClientToken;

export async function fetchAnthropicRealtimeToken(): Promise<AnthropicToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: anthropicChannel,
    topics: ['status'],
  });

  return token;
}
