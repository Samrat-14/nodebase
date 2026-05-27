'use server';

import type { Realtime } from 'inngest';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';
import { openaiChannel } from '@/inngest/channels/openai';

export type OpenAiToken = Realtime.Subscribe.ClientToken;

export async function fetchOpenAiRealtimeToken(): Promise<OpenAiToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: openaiChannel,
    topics: ['status'],
  });

  return token;
}
