'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ManualTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualTriggerDialog({ open, onOpenChange }: ManualTriggerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manual Trigger</DialogTitle>
          <DialogDescription>Configure the settings for manual trigger node.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Used to manually execute a workflow, no configuation available.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
