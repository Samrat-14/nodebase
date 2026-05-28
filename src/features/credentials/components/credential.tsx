'use client';

import z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CredentialType } from '@/generated/prisma/enums';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from '@/features/credentials/hooks/use-credentials';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(CredentialType),
  value: z.string().min(1, 'API Key is required'),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: 'OpenAI',
    logo: '/logos/openai.svg',
  },
  {
    value: CredentialType.GEMINI,
    label: 'Gemini',
    logo: '/logos/gemini.svg',
  },
  {
    value: CredentialType.ANTHROPIC,
    label: 'Anthropic',
    logo: '/logos/anthropic.svg',
  },
];

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export function CredentialForm({ initialData }: CredentialFormProps) {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      type: CredentialType.OPENAI,
      value: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (isEdit && initialData.id) {
      await updateCredential.mutateAsync({
        id: initialData.id,
        ...values,
      });
    } else {
      await createCredential.mutateAsync(values, {
        onSuccess: () => {
          router.push('/credentials');
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Credential' : 'Create Credential'}</CardTitle>
          <CardDescription>
            {isEdit
              ? 'Update your API key or credential details'
              : 'Add a new API key or credential to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input placeholder="My API key" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {credentialTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Image src={option.logo} alt={option.label} width={16} height={16} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="value"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>API Key</FieldLabel>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createCredential.isPending || updateCredential.isPending}
              >
                {createCredential.isPending || updateCredential.isPending ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/credentials" prefetch>
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export function CredentialView({ credentialId }: { credentialId: string }) {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
}
