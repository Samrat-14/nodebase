import { requireAuth } from '@/lib/auth-utils';

interface CredentialPageProps {
  params: Promise<{ credentialId: string }>;
}

export default async function CredentialPage({ params }: CredentialPageProps) {
  await requireAuth();

  const { credentialId } = await params;

  return <div>Credential ID: {credentialId}</div>;
}
