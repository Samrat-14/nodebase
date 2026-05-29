'use server';

import type { Realtime } from 'inngest';
import { getClientSubscriptionToken } from 'inngest/react';
import { inngest } from '@/inngest/client';
import { discordChannel } from '@/inngest/channels/discord';

export type DiscordToken = Realtime.Subscribe.ClientToken;

export async function fetchDiscordRealtimeToken(): Promise<DiscordToken> {
  const token = await getClientSubscriptionToken(inngest, {
    channel: discordChannel,
    topics: ['status'],
  });

  return token;
}
