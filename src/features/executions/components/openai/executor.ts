import { NonRetriableError } from 'inngest';
import Handlebars from 'handlebars';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { NodeExecutor } from '@/features/executions/types';
import { openaiChannel } from '@/inngest/channels/openai';
import { AVAILABLE_MODELS } from '@/features/executions/components/openai/dialog';

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type OpenAiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAiData> = async ({ data, nodeId, context, step }) => {
  await step.realtime.publish('loading:openai-generate-text', openaiChannel.status, {
    nodeId,
    status: 'loading',
  });

  if (!data.variableName) {
    await step.realtime.publish(
      'error:openai-generate-text:unconfigured-variable-name',
      openaiChannel.status,
      { nodeId, status: 'error' },
    );
    throw new NonRetriableError('OpenAI node: Variable name is missing');
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      'error:openai-generate-text:unconfigured-user-prompt',
      openaiChannel.status,
      { nodeId, status: 'error' },
    );
    throw new NonRetriableError('OpenAI node: User prompt is missing');
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : 'You are a helpful assistant.';
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credentialValue = process.env.OPENAI_API_KEY;
  const openai = createOpenAI({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap('openai-generate-text', generateText, {
      model: openai(data.model || AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: { isEnabled: true, recordInputs: true, recordOutputs: true },
    });

    const text = steps[0].content[0].type === 'text' ? steps[0].content[0].text : '';

    await step.realtime.publish('success:openai-generate-text', openaiChannel.status, {
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
      'error:openai-generate-text:failed-execution',
      openaiChannel.status,
      {
        nodeId,
        status: 'error',
      },
    );

    throw error;
  }
};
