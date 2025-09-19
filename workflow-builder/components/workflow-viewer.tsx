'use client';

import { useWorkflowStore } from '@/lib/state/workflow.store';
import { WorkflowGraph } from '@/components/workflow-graph';

export function WorkflowViewer() {
  const { currentWorkflow, isValid } = useWorkflowStore();

  if (!currentWorkflow) {
    return (
      <div className="workflow-viewer-empty">
        <p>Select a workflow file to view its graph</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="workflow-viewer-error">
        <p>Cannot render workflow: validation errors detected</p>
      </div>
    );
  }

  return (
    <div className="workflow-viewer">
      <WorkflowGraph workflow={currentWorkflow} readonly={true} />
    </div>
  );
}
