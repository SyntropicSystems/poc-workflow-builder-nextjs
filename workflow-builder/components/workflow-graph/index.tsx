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
import { convertFlowToNodes } from '@/lib/workflow-core/flow-to-nodes';
import type { Flow } from '@/lib/workflow-core';

interface WorkflowGraphProps {
  workflow: Flow;
  readonly?: boolean;
}

const nodeTypes = {
  stepNode: StepNode
};

export function WorkflowGraph({ workflow, readonly = true }: WorkflowGraphProps) {
  // Convert workflow to nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertFlowToNodes(workflow),
    [workflow]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // FIX: Sync state when workflow changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // In read-only mode, could show details in a panel
  }, []);

  return (
    <div className="workflow-graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readonly ? undefined : onNodesChange}
        onEdgesChange={readonly ? undefined : onEdgesChange}
        onNodeClick={onNodeClick}
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
          nodeStrokeColor={(node) => '#0070f3'}
          nodeColor={(node) => '#ffffff'}
          nodeBorderRadius={4}
        />
      </ReactFlow>
    </div>
  );
}
