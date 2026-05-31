import { useQueryStates } from 'nuqs';
import { executionParams } from '@/features/executions/params';

export const useExecutionsParams = () => {
  return useQueryStates(executionParams);
};
