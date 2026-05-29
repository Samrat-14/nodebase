'use server';

import type { Realtime } from 'inngest';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';
import { slackChannel } from '@/inngest/channels/slack';

export type SlackToken = Realtime.Subscribe.ClientToken;

export async function fetchSlackRealtimeToken(): Promise<SlackToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: slackChannel,
    topics: ['status'],
  });

  return token;
}
