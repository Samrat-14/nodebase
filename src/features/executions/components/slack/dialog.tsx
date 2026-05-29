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
  content: z.string().min(1, 'Message content is required'),
  webhookUrl: z.string().min(1, 'Webhook URL is required'),
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface SlackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
}

export function SlackDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: SlackDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || '',
      content: defaultValues.content || '',
      webhookUrl: defaultValues.webhookUrl || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || '',
        content: defaultValues.content || '',
        webhookUrl: defaultValues.webhookUrl || '',
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch('variableName') || 'slack_node';

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Slack Configuration</DialogTitle>
          <DialogDescription>Configure the Slack webhook settings for this node.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
          <Controller
            name="variableName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Variable Name</FieldLabel>
                <Input placeholder="slack_node" {...field} aria-invalid={fieldState.invalid} />
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
                  placeholder="https://hooks.slack.com/services/..."
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Get this from Slack: Workspace Settings → Workflows → Webhooks
                </FieldDescription>
                <FieldDescription>Make sure you have "content" variable</FieldDescription>
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
          <DialogFooter className="mt-4">
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
