import { createLoader } from 'nuqs/server';
import { executionParams } from '@/features/executions/params';

export const executionsParamsLoader = createLoader(executionParams);
