'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { StepNodeData } from '@/lib/workflow-core/flow-to-nodes';

function StepNodeComponent({ data }: NodeProps<StepNodeData>) {
  const { step, hasToken, instructionCount, checkCount } = data;

  return (
    <div className="step-node">
      <Handle type="target" position={Position.Top} />
      
      <div className="step-node-header">
        <span className="step-id">{step.id}</span>
        {hasToken && <span className="token-badge">🔐</span>}
      </div>
      
      <div className="step-node-title">
        {step.title || 'Untitled Step'}
      </div>
      
      <div className="step-node-role">
        Role: {step.role || 'unassigned'}
      </div>
      
      <div className="step-node-stats">
        <span>📝 {instructionCount}</span>
        <span>✓ {checkCount}</span>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export const StepNode = memo(StepNodeComponent);
