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
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
  endpoint: z.url({ message: 'Please enter a valid URL' }),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  body: z.string().optional(),
});

export type FormType = z.infer<typeof formSchema>;

interface HttpRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultEndpoint?: string;
  defaultMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  defaultBody?: string;
}

export function HttpRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultEndpoint = '',
  defaultMethod = 'GET',
  defaultBody = '',
}: HttpRequestDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: defaultEndpoint,
      method: defaultMethod,
      body: defaultBody,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        endpoint: defaultEndpoint,
        method: defaultMethod,
        body: defaultBody,
      });
    }
  }, [open, defaultEndpoint, defaultMethod, defaultBody, form]);

  const watchMethod = form.watch('method');
  const showBodyField = ['POST', 'PUT', 'PATCH'].includes(watchMethod);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>Configure the settings for HTTP Request node.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-4">
          <Controller
            name="method"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Method</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>The HTTP method to use for this request</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="endpoint"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Endpoint URL</FieldLabel>
                <Input
                  placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Static URL or use {'{{variables}}'} for simple values or {'{{json variable}}'} to
                  stringify objects
                </FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          {showBodyField && (
            <Controller
              name="body"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Request Body</FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder={
                      '{\n  "userId": "{{httpResponse.data.id}}",\n  "name": "{{httpsResponse.data.name}}",\n  "items": "{{httpResponse.data.items}}"\n}'
                    }
                    className="min-h-[120px] font-mono text-sm"
                  />
                  <FieldDescription>
                    JSON with template variables.Use {'{{variables}}'} for simple values or{' '}
                    {'{{json variable}}'} to stringify objects
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}
          <DialogFooter className="mt-4">
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
