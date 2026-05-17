import { AuthLayout as AuthLayoutWrapper } from '@/features/auth/components/auth-layout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
