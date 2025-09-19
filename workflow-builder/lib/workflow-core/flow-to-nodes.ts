import type { Node, Edge } from 'reactflow';
import type { Flow, Step } from './generated';

export interface StepNodeData {
  step: Step;
  hasToken: boolean;
  instructionCount: number;
  checkCount: number;
}

export function convertFlowToNodes(workflow: Flow): { nodes: Node[]; edges: Edge[] } {
  if (!workflow.steps || workflow.steps.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const steps = workflow.steps; // Type assertion for safety
  
  // Calculate node positions (simple vertical layout)
  const nodeWidth = 250;
  const nodeHeight = 120;
  const horizontalSpacing = 100;
  const verticalSpacing = 150;
  
  // Create nodes from steps
  steps.forEach((step, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    
    nodes.push({
      id: step.id || `step_${index}`,
      type: 'stepNode',
      position: {
        x: col * (nodeWidth + horizontalSpacing),
        y: row * (nodeHeight + verticalSpacing)
      },
      data: {
        step,
        hasToken: !!step.token,
        instructionCount: step.instructions?.length || 0,
        checkCount: step.acceptance?.checks?.length || 0
      } as StepNodeData
    });
  });

  // Create edges from next arrays and implicit sequential flow
  steps.forEach((step, index) => {
    const currentId = step.id || `step_${index}`;
    
    if (step.next && step.next.length > 0) {
      // Explicit next steps
      step.next.forEach((nextStep, nextIndex) => {
        if (nextStep.to) {
          edges.push({
            id: `${currentId}->${nextStep.to}-${nextIndex}`,
            source: currentId,
            target: nextStep.to,
            label: nextStep.when || undefined,
            type: 'smoothstep',
            animated: false
          });
        }
      });
    } else if (index < steps.length - 1) {
      // Implicit sequential flow to next step (only if no explicit next)
      const nextId = steps[index + 1].id || `step_${index + 1}`;
      edges.push({
        id: `${currentId}->${nextId}`,
        source: currentId,
        target: nextId,
        type: 'smoothstep',
        animated: false
      });
    }
  });

  return { nodes, edges };
}
