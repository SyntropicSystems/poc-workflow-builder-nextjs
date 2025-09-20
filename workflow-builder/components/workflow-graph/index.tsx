'use client';

import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode
} from 'reactflow';
import { StepNode } from './step-node';
import { flowToReactFlow } from './flow-converter';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import type { Flow } from '@/lib/workflow-core';

interface WorkflowGraphProps {
  workflow: Flow;
  readonly?: boolean;
}

const nodeTypes = {
  stepNode: StepNode
};

export function WorkflowGraph({ workflow, readonly = true }: WorkflowGraphProps) {
  const { selectStep, selectedStepId } = useWorkflowStore();
  
  // Convert workflow to nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => flowToReactFlow(workflow),
    [workflow]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when workflow changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Update node selection state
  useEffect(() => {
    setNodes((nodes) => 
      nodes.map((node) => ({
        ...node,
        selected: node.id === selectedStepId
      }))
    );
  }, [selectedStepId, setNodes]);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    selectStep(node.id);
  }, [selectStep]);

  // Handle background click to deselect
  const onPaneClick = useCallback(() => {
    selectStep(null);
  }, [selectStep]);

  return (
    <div className="workflow-graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readonly ? undefined : onNodesChange}
        onEdgesChange={readonly ? undefined : onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeColor={(node) => node.selected ? '#ff0000' : '#0070f3'}
          nodeColor={(node) => node.selected ? '#ffe0e0' : '#ffffff'}
          nodeBorderRadius={4}
        />
      </ReactFlow>
    </div>
  );
}
