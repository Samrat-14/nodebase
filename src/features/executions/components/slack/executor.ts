import ky from 'ky';
import Handlebars from 'handlebars';
import { decode } from 'html-entities';
import { NonRetriableError } from 'inngest';
import { slackChannel } from '@/inngest/channels/slack';
import type { NodeExecutor } from '@/features/executions/types';

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({ data, nodeId, context, step }) => {
  await step.realtime.publish('loading:slack-webhook', slackChannel.status, {
    nodeId,
    status: 'loading',
  });

  try {
    const result = await step.run('slack-webhook', async () => {
      if (!data.variableName) {
        await step.realtime.publish(
          'error:slack-webhook:unconfigured-variable-name',
          slackChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('Slack node: Variable name is missing');
      }

      if (!data.webhookUrl) {
        await step.realtime.publish(
          'error:slack-webhook:unconfigured-webhookUrl',
          slackChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('Slack node: Webhook URL is missing');
      }

      if (!data.content) {
        await step.realtime.publish(
          'error:slack-webhook:unconfigured-content',
          slackChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('Slack node: Content is missing');
      }

      const rawContent = Handlebars.compile(data.content)(context);
      const content = decode(rawContent);

      await ky.post(data.webhookUrl, {
        json: {
          content: content, // The key depends on workflow config
        },
      });

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await step.realtime.publish('success:slack', slackChannel.status, {
      nodeId,
      status: 'success',
    });

    return result;
  } catch (error) {
    await step.realtime.publish('error:slack-webhook:failed-execution', slackChannel.status, {
      nodeId,
      status: 'error',
    });

    throw error;
  }
};
