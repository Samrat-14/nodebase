import { NonRetriableError } from 'inngest';
import ky, { type Options as KyOptions } from 'ky';
import type { NodeExecutor } from '@/features/executions/types';

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
  if (!data.variableName) {
    throw new NonRetriableError('HTTP Request node: Variable name not configured');
  }

  if (!data.endpoint) {
    throw new NonRetriableError('HTTP Request node: No endpoint configured');
  }

  const result = await step.run('http-request', async () => {
    const endpoint = data.endpoint!;
    const method = data.method || 'GET';

    const options: KyOptions = { method };

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = data.body;
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
      [data.variableName!]: responsePayload,
    };
  });

  return result;
};
