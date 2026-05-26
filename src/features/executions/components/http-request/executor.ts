import { NonRetriableError } from 'inngest';
import ky, { type Options as KyOptions } from 'ky';
import Handlebars from 'handlebars';
import type { NodeExecutor } from '@/features/executions/types';
import { httpRequestChannel } from '@/inngest/channels/http-request';

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish('loading:http-request', httpRequestChannel.status, {
    nodeId,
    status: 'loading',
  });

  try {
    const result = await step.run('http-request', async () => {
      if (!data.variableName) {
        await step.realtime.publish(
          'error:http-request:unconfigured-variable-name',
          httpRequestChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('HTTP Request node: No variable name configured');
      }

      if (!data.endpoint) {
        await step.realtime.publish(
          'error:http-request:unconfigured-endpoint',
          httpRequestChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('HTTP Request node: No endpoint configured');
      }

      if (!data.method) {
        await step.realtime.publish(
          'error:http-request:unconfigured-method',
          httpRequestChannel.status,
          { nodeId, status: 'error' },
        );
        throw new NonRetriableError('HTTP Request node: No method configured');
      }

      const endpoint = Handlebars.compile(data.endpoint)(context);
      const method = data.method;

      const options: KyOptions = { method };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const resolved = Handlebars.compile(data.body || '{}')(context);
        JSON.parse(resolved);
        options.body = resolved;
        options.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get('content-type');
      const responseData = contentType?.includes('application/json')
        ? await response.json().catch(() => response.text())
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await step.realtime.publish('success:http-request', httpRequestChannel.status, {
      nodeId,
      status: 'success',
    });

    return result;
  } catch (error) {
    await step.realtime.publish('error:http-request:failed-execution', httpRequestChannel.status, {
      nodeId,
      status: 'error',
    });

    throw error;
  }
};
