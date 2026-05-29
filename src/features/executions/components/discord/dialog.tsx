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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: 'Variable name is required' })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        'Variable name must start with a letter or underscore and contain only letters, numbers and underscores',
    }),
  username: z.string().optional(),
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(2000, 'Discord messages cannot exceed 2000 characters'),
  webhookUrl: z.string().min(1, 'Webhook URL is required'),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface DiscordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<DiscordFormValues>;
}

export function DiscordDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: DiscordDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || '',
      username: defaultValues.username || '',
      content: defaultValues.content || '',
      webhookUrl: defaultValues.webhookUrl || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || '',
        username: defaultValues.username || '',
        content: defaultValues.content || '',
        webhookUrl: defaultValues.webhookUrl || '',
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch('variableName') || 'discord_node';

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Discord Configuration</DialogTitle>
          <DialogDescription>
            Configure the Discord webhook settings for this node.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
          <Controller
            name="variableName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Variable Name</FieldLabel>
                <Input placeholder="discord_node" {...field} aria-invalid={fieldState.invalid} />
                <FieldDescription>
                  Use this name to reference the result in other nodes:{' '}
                  {`{{${watchVariableName}.messageContent}}`}
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="webhookUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Webhook URL</FieldLabel>
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Get this from Discord: Channel Settings → Integrations → Webhooks
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Message Content</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Summary: {{gemini_node.aiResponse}}"
                  className="min-h-[80px] font-mono text-sm"
                />
                <FieldDescription>
                  The message to send. Use {'{{variables}}'} for simple values or{' '}
                  {'{{json variable}}'} to stringify objects
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Bot Username (Optional)</FieldLabel>
                <Input placeholder="Workflow Bot" {...field} aria-invalid={fieldState.invalid} />
                <FieldDescription>Override the webhook's default username</FieldDescription>
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
