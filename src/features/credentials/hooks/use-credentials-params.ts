import { useQueryStates } from 'nuqs';
import { credentialParams } from '@/features/credentials/params';

export const useCredentialsParams = () => {
  return useQueryStates(credentialParams);
};
