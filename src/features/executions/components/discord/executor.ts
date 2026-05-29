import ky from 'ky';
import Handlebars from 'handlebars';
import { decode } from 'html-entities';
import { NonRetriableError } from 'inngest';
import { discordChannel } from '@/inngest/channels/discord';
import type { NodeExecutor } from '@/features/executions/types';

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish('loading:discord-webhook', discordChannel.status, {
    nodeId,
    status: 'loading',
  });

  try {
    const result = await step.run('discord-webhook', async () => {
      if (!data.variableName) {
        await step.realtime.publish(
          'error:discord-webhook:unconfigured-variable-name',
          discordChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('Discord node: Variable name is missing');
      }

      if (!data.webhookUrl) {
        await step.realtime.publish(
          'error:discord-webhook:unconfigured-webhookUrl',
          discordChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('Discord node: Webhook URL is missing');
      }

      if (!data.content) {
        await step.realtime.publish(
          'error:discord-webhook:unconfigured-content',
          discordChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('Discord node: Content is missing');
      }

      const rawContent = Handlebars.compile(data.content)(context);
      const content = decode(rawContent);
      const username = data.username
        ? decode(Handlebars.compile(data.username)(context))
        : undefined;

      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000), // Discord's max message length
          username,
        },
      });

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await step.realtime.publish('success:discord', discordChannel.status, {
      nodeId,
      status: 'success',
    });

    return result;
  } catch (error) {
    await step.realtime.publish('error:discord-webhook:failed-execution', discordChannel.status, {
      nodeId,
      status: 'error',
    });

    throw error;
  }
};
