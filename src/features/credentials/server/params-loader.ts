import { createLoader } from 'nuqs/server';
import { credentialParams } from '@/features/credentials/params';

export const credentialsParamsLoader = createLoader(credentialParams);
