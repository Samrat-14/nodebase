'use client';

import { memo } from 'react';
import { PlusIcon, SettingsIcon, TrashIcon } from 'lucide-react';
import { NodeToolbar, Position, type NodeProps } from '@xyflow/react';
import { PlaceholderNode } from '@/components/react-flow/placeholder-node';
import { Button } from '@/components/ui/button';
import { p } from '@polar-sh/better-auth/client';

interface WorkflowNodeProps {
  children: React.ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
}

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size="sm" variant="ghost" onClick={onSettings}>
            <SettingsIcon className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <TrashIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar position={Position.Bottom} isVisible className="max-w-[200px] text-center">
          <p className="font-medium">{name}</p>
          {description && <p className="text-muted-foreground truncate text-sm">{description}</p>}
        </NodeToolbar>
      )}
    </>
  );
}
