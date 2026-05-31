import { NonRetriableError } from 'inngest';
import { inngest } from './client';
import prisma from '@/lib/db';
import { topologicalSort } from '@/inngest/utils';
import { ExecutionStatus, type NodeType } from '@/generated/prisma/enums';
import { getExecutor } from '@/features/executions/lib/executor-registry';

export const executeWorkflow = inngest.createFunction(
  {
    id: 'execute-workflow',
    triggers: { event: 'workflows/execute.workflow' },
    retries: 0, // TODO: Remove in production
    onFailure: async ({ event }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
  async ({ event, step }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError('Event ID or Workflow ID is missing');
    }

    await step.run('create-execution', async () => {
      return prisma.execution.create({
        data: { workflowId, inngestEventId },
      });
    });

    const sortedNodes = await step.run('prepare-workflow', async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: { nodes: true, connections: true },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run('find-user-id', async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: { userId: true },
      });
      return workflow.userId;
    });

    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        userId,
        nodeId: node.id,
        context,
        step,
      });
    }

    await step.run('update-execution', async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return { workflowId, result: context };
  },
);
