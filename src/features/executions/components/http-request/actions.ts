'use server';

import type { Realtime } from 'inngest';
import { httpRequestChannel } from '@/inngest/channels/http-request';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';

export type HttpRequestToken = Realtime.Subscribe.ClientToken;

export async function fetchHttpRequestRealtimeToken(): Promise<HttpRequestToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: httpRequestChannel,
    topics: ['status'],
  });

  return token;
}
