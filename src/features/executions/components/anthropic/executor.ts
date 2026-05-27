import { NonRetriableError } from 'inngest';
import Handlebars from 'handlebars';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { NodeExecutor } from '@/features/executions/types';
import { anthropicChannel } from '@/inngest/channels/anthropic';
import { AVAILABLE_MODELS } from '@/features/executions/components/anthropic/dialog';

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type AnthropicData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish('loading:anthropic-generate-text', anthropicChannel.status, {
    nodeId,
    status: 'loading',
  });

  if (!data.variableName) {
    await step.realtime.publish(
      'error:anthropic-generate-text:unconfigured-variable-name',
      anthropicChannel.status,
      { nodeId, status: 'error' },
    );
    throw new NonRetriableError('Anthropic node: Variable name is missing');
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      'error:anthropic-generate-text:unconfigured-user-prompt',
      anthropicChannel.status,
      { nodeId, status: 'error' },
    );
    throw new NonRetriableError('Anthropic node: User prompt is missing');
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : 'You are a helpful assistant.';
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credentialValue = process.env.ANTHROPIC_API_KEY;
  const anthropic = createAnthropic({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap('anthropic-generate-text', generateText, {
      model: anthropic(data.model || AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: { isEnabled: true, recordInputs: true, recordOutputs: true },
    });

    const text = steps[0].content[0].type === 'text' ? steps[0].content[0].text : '';

    await step.realtime.publish('success:anthropic-generate-text', anthropicChannel.status, {
      nodeId,
      status: 'success',
    });

    return {
      ...context,
      [data.variableName]: {
        aiResponse: text,
      },
    };
  } catch (error) {
    await step.realtime.publish(
      'error:anthropic-generate-text:failed-execution',
      anthropicChannel.status,
      {
        nodeId,
        status: 'error',
      },
    );

    throw error;
  }
};
