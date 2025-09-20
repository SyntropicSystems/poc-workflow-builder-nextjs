'use client';

import type { Node, Edge } from 'reactflow';
import type { Flow } from '@/lib/workflow-core/generated';
import { flowToGraphData } from '@/lib/workflow-core/flow-to-nodes';

/**
 * Convert workflow to React Flow format
 * This is the UI layer adapter for the framework-agnostic core
 */
export function flowToReactFlow(workflow: Flow): { nodes: Node[]; edges: Edge[] } {
  const { nodes: graphNodes, edges: graphEdges } = flowToGraphData(workflow);
  
  // Convert plain graph nodes to React Flow nodes
  const nodes: Node[] = graphNodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data
  }));
  
  // Convert plain graph edges to React Flow edges
  const edges: Edge[] = graphEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: edge.type,
    animated: edge.animated
  }));
  
  return { nodes, edges };
}
