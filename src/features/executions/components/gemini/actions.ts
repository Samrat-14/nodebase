'use server';

import type { Realtime } from 'inngest';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';
import { geminiChannel } from '@/inngest/channels/gemini';

export type GeminiToken = Realtime.Subscribe.ClientToken;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: geminiChannel,
    topics: ['status'],
  });

  return token;
}
