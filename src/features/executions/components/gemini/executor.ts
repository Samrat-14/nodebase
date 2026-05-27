import { NonRetriableError } from 'inngest';
import Handlebars from 'handlebars';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { NodeExecutor } from '@/features/executions/types';
import { geminiChannel } from '@/inngest/channels/gemini';
import { AVAILABLE_MODELS } from '@/features/executions/components/gemini/dialog';

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({ data, nodeId, context, step }) => {
  await step.realtime.publish('loading:gemini-generate-text', geminiChannel.status, {
    nodeId,
    status: 'loading',
  });

  if (!data.variableName) {
    await step.realtime.publish(
      'error:gemini-generate-text:unconfigured-variable-name',
      geminiChannel.status,
      { nodeId, status: 'error' },
    );
    throw new NonRetriableError('Gemini node: Variable name is missing');
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      'error:gemini-generate-text:unconfigured-user-prompt',
      geminiChannel.status,
      { nodeId, status: 'error' },
    );
    throw new NonRetriableError('Gemini node: User prompt is missing');
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : 'You are a helpful assistant.';
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const google = createGoogleGenerativeAI({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap('gemini-generate-text', generateText, {
      model: google(data.model || AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: { isEnabled: true, recordInputs: true, recordOutputs: true },
    });

    const text = steps[0].content[0].type === 'text' ? steps[0].content[0].text : '';

    await step.realtime.publish('success:gemini-generate-text', geminiChannel.status, {
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
      'error:gemini-generate-text:failed-execution',
      geminiChannel.status,
      {
        nodeId,
        status: 'error',
      },
    );

    throw error;
  }
};
