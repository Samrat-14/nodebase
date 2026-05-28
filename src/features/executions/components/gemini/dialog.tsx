'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCredentialsByType } from '@/features/credentials/hooks/use-credentials';
import { CredentialType } from '@/generated/prisma/enums';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

export const AVAILABLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: 'Variable name is required' })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        'Variable name must start with a letter or underscore and contain only letters, numbers and underscores',
    }),
  credentialId: z.string().min(1, { message: 'Credential is required' }),
  model: z.enum(AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { message: 'User prompt is required' }),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface GeminiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<GeminiFormValues>;
}

export function GeminiDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: GeminiDialogProps) {
  const { data: credentials, isLoading: isLoadingCredentials } = useCredentialsByType(
    CredentialType.GEMINI,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || '',
      credentialId: defaultValues.credentialId || '',
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || '',
      userPrompt: defaultValues.userPrompt || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || '',
        credentialId: defaultValues.credentialId || '',
        model: defaultValues.model || AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || '',
        userPrompt: defaultValues.userPrompt || '',
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch('variableName') || 'gemini_node';

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Gemini Configuration</DialogTitle>
          <DialogDescription>Configure the AI model and prompts for this node.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
          <Controller
            name="variableName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Variable Name</FieldLabel>
                <Input placeholder="gemini_node" {...field} aria-invalid={fieldState.invalid} />
                <FieldDescription>
                  Use this name to reference the result in other nodes:{' '}
                  {`{{${watchVariableName}.aiResponse}}`}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="credentialId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Credential</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingCredentials || credentials?.length === 0}
                >
                  <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                    <SelectValue placeholder="Select a credential" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentials?.map((credential) => (
                      <SelectItem key={credential.id} value={credential.id}>
                        <div className="flex items-center gap-2">
                          <Image src="/logos/gemini.svg" alt="Gemini" height={16} width={16} />
                          {credential.name}
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
            name="model"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Model</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>The Google Gemini model to use for completion</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="systemPrompt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>System Prompt (Optional)</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="You are a helpful assistant."
                  className="min-h-[80px] font-mono text-sm"
                />
                <FieldDescription>
                  Sets the behavior of the assistant. Use {'{{variables}}'} for simple values or{' '}
                  {'{{json variable}}'} to stringify objects
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="userPrompt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>User Prompt</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Summarize this text: {{json httpResponse.data}}"
                  className="min-h-[120px] font-mono text-sm"
                />
                <FieldDescription>
                  The prompt to send to the AI. Use {'{{variables}}'} for simple values or{' '}
                  {'{{json variable}}'} to stringify objects
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <DialogFooter className="mt-4">
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
