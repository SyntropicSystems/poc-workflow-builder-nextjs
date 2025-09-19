# Task 2.5: Edge Management

## Objective

Enable users to manage workflow connections by adding, editing, and removing edges (next conditions) between steps.

## Prerequisites

- Tasks 2.1-2.4 completed
- Steps can be added/removed
- React Flow graph with nodes and edges
- Edit mode working

## Implementation Steps

### Step 1: Implement Core API Functions for Edge Management

Update `lib/workflow-core/api.ts`:

```typescript
export function addEdge(
  workflow: Flow,
  sourceStepId: string,
  targetStepId: string,
  condition: string
): Result<Flow> {
  try {
    // Validate both steps exist
    const sourceStep = workflow.steps?.find(s => s.id === sourceStepId);
    const targetStep = workflow.steps?.find(s => s.id === targetStepId);
    
    if (!sourceStep) {
      return {
        success: false,
        error: new Error(`Source step "${sourceStepId}" not found`)
      };
    }
    
    if (!targetStep) {
      return {
        success: false,
        error: new Error(`Target step "${targetStepId}" not found`)
      };
    }
    
    // Validate condition format (lowercase with underscores)
    const conditionPattern = /^[a-z][a-z0-9_]*$/;
    if (!conditionPattern.test(condition)) {
      return {
        success: false,
        error: new Error('Condition must be lowercase with underscores only')
      };
    }
    
    // Check for circular dependency
    if (wouldCreateCycle(workflow, sourceStepId, targetStepId)) {
      return {
        success: false,
        error: new Error('This connection would create a circular dependency')
      };
    }
    
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    const updatedStep = updatedWorkflow.steps!.find(s => s.id === sourceStepId)!;
    
    if (!updatedStep.next) {
      updatedStep.next = {};
    }
    
    // Check if condition already exists
    if (updatedStep.next[condition]) {
      return {
        success: false,
        error: new Error(`Condition "${condition}" already exists for this step`)
      };
    }
    
    updatedStep.next[condition] = targetStepId;
    
    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to add edge')
    };
  }
}

export function updateEdge(
  workflow: Flow,
  sourceStepId: string,
  oldCondition: string,
  newCondition: string,
  newTargetId?: string
): Result<Flow> {
  try {
    const sourceStep = workflow.steps?.find(s => s.id === sourceStepId);
    
    if (!sourceStep || !sourceStep.next) {
      return {
        success: false,
        error: new Error(`Source step "${sourceStepId}" not found or has no edges`)
      };
    }
    
    if (!sourceStep.next[oldCondition]) {
      return {
        success: false,
        error: new Error(`Condition "${oldCondition}" not found`)
      };
    }
    
    // If updating target, validate it exists
    if (newTargetId && !workflow.steps?.find(s => s.id === newTargetId)) {
      return {
        success: false,
        error: new Error(`Target step "${newTargetId}" not found`)
      };
    }
    
    // Validate new condition format if changed
    if (newCondition !== oldCondition) {
      const conditionPattern = /^[a-z][a-z0-9_]*$/;
      if (!conditionPattern.test(newCondition)) {
        return {
          success: false,
          error: new Error('Condition must be lowercase with underscores only')
        };
      }
    }
    
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    const updatedStep = updatedWorkflow.steps!.find(s => s.id === sourceStepId)!;
    
    const targetId = newTargetId || updatedStep.next![oldCondition];
    
    // Remove old condition if name changed
    if (oldCondition !== newCondition) {
      delete updatedStep.next![oldCondition];
    }
    
    updatedStep.next![newCondition] = targetId;
    
    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to update edge')
    };
  }
}

export function removeEdge(
  workflow: Flow,
  sourceStepId: string,
  condition: string
): Result<Flow> {
  try {
    const sourceStep = workflow.steps?.find(s => s.id === sourceStepId);
    
    if (!sourceStep || !sourceStep.next) {
      return {
        success: false,
        error: new Error(`Source step "${sourceStepId}" not found or has no edges`)
      };
    }
    
    if (!sourceStep.next[condition]) {
      return {
        success: false,
        error: new Error(`Condition "${condition}" not found`)
      };
    }
    
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    const updatedStep = updatedWorkflow.steps!.find(s => s.id === sourceStepId)!;
    
    delete updatedStep.next![condition];
    
    // If no conditions remain, remove the next object entirely
    if (Object.keys(updatedStep.next!).length === 0) {
      delete updatedStep.next;
    }
    
    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to remove edge')
    };
  }
}

// Helper function to detect cycles
function wouldCreateCycle(
  workflow: Flow,
  sourceId: string,
  targetId: string
): boolean {
  // Simple DFS to check if targetId can reach sourceId
  const visited = new Set<string>();
  const stack = [targetId];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (current === sourceId) {
      return true; // Found cycle
    }
    
    if (visited.has(current)) {
      continue;
    }
    
    visited.add(current);
    
    const step = workflow.steps?.find(s => s.id === current);
    if (step?.next) {
      for (const nextStepId of Object.values(step.next)) {
        if (!visited.has(nextStepId)) {
          stack.push(nextStepId);
        }
      }
    }
  }
  
  return false;
}
```

### Step 2: Create Edge Editor Component

Create `components/edge-editor/index.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import type { Step } from '@/lib/workflow-core/generated';
import styles from './edge-editor.module.css';

interface EdgeEditorProps {
  step: Step;
  onClose?: () => void;
}

export function EdgeEditor({ step, onClose }: EdgeEditorProps) {
  const [edges, setEdges] = useState<{ condition: string; target: string }[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { currentWorkflow, updateStep } = useWorkflowStore();
  
  useEffect(() => {
    // Initialize edges from step
    if (step.next) {
      const edgeList = Object.entries(step.next).map(([condition, target]) => ({
        condition,
        target
      }));
      setEdges(edgeList);
    } else {
      setEdges([]);
    }
  }, [step]);
  
  const availableTargets = currentWorkflow?.steps
    ?.filter(s => s.id !== step.id)
    ?.map(s => ({ id: s.id, title: s.title || s.id })) || [];
  
  const handleAddEdge = () => {
    const conditionPattern = /^[a-z][a-z0-9_]*$/;
    
    if (!newCondition) {
      setError('Condition is required');
      return;
    }
    
    if (!conditionPattern.test(newCondition)) {
      setError('Condition must be lowercase with underscores only');
      return;
    }
    
    if (!newTarget) {
      setError('Target step is required');
      return;
    }
    
    if (edges.some(e => e.condition === newCondition)) {
      setError('Condition already exists');
      return;
    }
    
    const updatedEdges = [...edges, { condition: newCondition, target: newTarget }];
    setEdges(updatedEdges);
    updateStepEdges(updatedEdges);
    
    setNewCondition('');
    setNewTarget('');
    setError(null);
  };
  
  const handleUpdateEdge = (index: number, condition: string, target: string) => {
    const updatedEdges = [...edges];
    updatedEdges[index] = { condition, target };
    setEdges(updatedEdges);
    updateStepEdges(updatedEdges);
    setEditingIndex(null);
  };
  
  const handleRemoveEdge = (index: number) => {
    const updatedEdges = edges.filter((_, i) => i !== index);
    setEdges(updatedEdges);
    updateStepEdges(updatedEdges);
  };
  
  const updateStepEdges = (edgeList: { condition: string; target: string }[]) => {
    const next = edgeList.length > 0
      ? edgeList.reduce((acc, edge) => ({
          ...acc,
          [edge.condition]: edge.target
        }), {})
      : undefined;
    
    updateStep(step.id, { next });
  };
  
  const suggestCondition = () => {
    const commonConditions = [
      'success', 'failure', 'approved', 'rejected',
      'complete', 'error', 'timeout', 'retry'
    ];
    
    for (const condition of commonConditions) {
      if (!edges.some(e => e.condition === condition)) {
        setNewCondition(condition);
        break;
      }
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Edges for: {step.title || step.id}</h3>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton}>×</button>
        )}
      </div>
      
      <div className={styles.edgeList}>
        {edges.length === 0 && (
          <div className={styles.emptyState}>
            No edges configured. Add one below.
          </div>
        )}
        
        {edges.map((edge, index) => (
          <div key={index} className={styles.edge}>
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={edge.condition}
                  onChange={e => {
                    const updated = [...edges];
                    updated[index].condition = e.target.value;
                    setEdges(updated);
                  }}
                  className={styles.conditionInput}
                />
                <span className={styles.arrow}>→</span>
                <select
                  value={edge.target}
                  onChange={e => {
                    const updated = [...edges];
                    updated[index].target = e.target.value;
                    setEdges(updated);
                  }}
                  className={styles.targetSelect}
                >
                  {availableTargets.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleUpdateEdge(index, edge.condition, edge.target)}
                  className={styles.saveButton}
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className={styles.cancelButton}
                >
                  ×
                </button>
              </>
            ) : (
              <>
                <span className={styles.condition}>{edge.condition}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.target}>{edge.target}</span>
                <button
                  onClick={() => setEditingIndex(index)}
                  className={styles.editButton}
                  title="Edit edge"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleRemoveEdge(index)}
                  className={styles.removeButton}
                  title="Remove edge"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className={styles.addSection}>
        <h4>Add New Edge</h4>
        <div className={styles.addForm}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              placeholder="Condition (e.g., success)"
              className={styles.conditionInput}
            />
            <button onClick={suggestCondition} className={styles.suggestButton}>
              Suggest
            </button>
          </div>
          
          <span className={styles.arrow}>→</span>
          
          <select
            value={newTarget}
            onChange={e => setNewTarget(e.target.value)}
            className={styles.targetSelect}
          >
            <option value="">Select target...</option>
            {availableTargets.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          
          <button
            onClick={handleAddEdge}
            className={styles.addButton}
            disabled={!newCondition || !newTarget}
          >
            Add Edge
          </button>
        </div>
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}
      </div>
    </div>
  );
}
```

### Step 3: Create Edge Editor Styles

Create `components/edge-editor/edge-editor.module.css`:

```css
.container {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.header h3 {
  margin: 0;
  font-size: 16px;
}

.closeButton {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
}

.edgeList {
  margin-bottom: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.emptyState {
  padding: 12px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.edge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.condition,
.target {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
}

.condition {
  background: #e3f2fd;
  color: #1565c0;
}

.target {
  background: #f3e5f5;
  color: #6a1b9a;
}

.arrow {
  color: #666;
  font-size: 14px;
}

.editButton,
.removeButton,
.saveButton,
.cancelButton {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: auto;
}

.editButton {
  background: #fff3e0;
}

.removeButton {
  background: #ffebee;
}

.saveButton {
  background: #e8f5e9;
}

.cancelButton {
  background: #f5f5f5;
}

.addSection {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.addSection h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.addForm {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inputGroup {
  display: flex;
  gap: 4px;
}

.conditionInput,
.targetSelect {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.conditionInput {
  width: 150px;
}

.targetSelect {
  flex: 1;
  min-width: 150px;
}

.suggestButton {
  padding: 8px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.suggestButton:hover {
  background: #e0e0e0;
}

.addButton {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.addButton:hover:not(:disabled) {
  background: #059669;
}

.addButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #ff0000;
  font-size: 12px;
  margin-top: 8px;
  padding: 4px 8px;
  background: #ffebeb;
  border-radius: 4px;
}
```

### Step 4: Extend Workflow Store for Edge Management

Update `lib/state/workflow.store.ts`:

```typescript
// Add to WorkflowState interface:
interface WorkflowState {
  // ... existing properties
  addEdge: (sourceId: string, targetId: string, condition: string) => void;
  updateEdge: (sourceId: string, oldCondition: string, newCondition: string, targetId?: string) => void;
  removeEdge: (sourceId: string, condition: string) => void;
}

// Add to store implementation:
export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // ... existing methods

  addEdge: (sourceId, targetId, condition) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = addEdge(state.currentWorkflow, sourceId, targetId, condition);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(result.data, validation);
    } else {
      console.error('Failed to add edge:', result.error);
    }
  },
  
  updateEdge: (sourceId, oldCondition, newCondition, targetId) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = updateEdge(state.currentWorkflow, sourceId, oldCondition, newCondition, targetId);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(result.data, validation);
    } else {
      console.error('Failed to update edge:', result.error);
    }
  },
  
  removeEdge: (sourceId, condition) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = removeEdge(state.currentWorkflow, sourceId, condition);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(result.data, validation);
    } else {
      console.error('Failed to remove edge:', result.error);
    }
  }
}));
```

### Step 5: Enable Interactive Edge Creation in React Flow

Update `components/workflow-graph/index.tsx`:

```typescript
'use client';

import { useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge as rfAddEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { StepNode } from './step-node';
import { flowToReactFlow } from '@/lib/workflow-core/graph-converter';
import styles from './workflow-graph.module.css';

const nodeTypes = {
  step: StepNode
};

export function WorkflowGraph() {
  const connectionLineStyle = { stroke: '#999' };
  const defaultEdgeOptions = {
    style: { stroke: '#666' },
    type: 'smoothstep',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#666'
    }
  };
  
  const {
    currentWorkflow,
    selectStep,
    editMode,
    addEdge
  } = useWorkflowStore();
  
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!currentWorkflow) {
      return { nodes: [], edges: [] };
    }
    return flowToReactFlow(currentWorkflow);
  }, [currentWorkflow]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update nodes and edges when workflow changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectStep(node.id);
  }, [selectStep]);
  
  const onPaneClick = useCallback(() => {
    selectStep(null);
  }, [selectStep]);
  
  const onConnect = useCallback((params: Connection) => {
    if (!editMode) return;
    
    const sourceId = params.source;
    const targetId = params.target;
    
    if (!sourceId || !targetId) return;
    
    // Prompt for condition name
    const condition = prompt('Enter condition name (lowercase with underscores):');
    
    if (!condition) return;
    
    // Validate condition format
    const conditionPattern = /^[a-z][a-z0-9_]*$/;
    if (!conditionPattern.test(condition)) {
      alert('Condition must be lowercase with underscores only');
      return;
    }
    
    // Add edge through store (which updates workflow)
    addEdge(sourceId, targetId, condition);
  }, [editMode, addEdge]);
  
  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (!editMode) return;
    
    // Extract source and condition from edge
    const [sourceId, condition] = edge.id.split('_');
    
    const action = confirm('Delete this edge?');
    if (action) {
      // Remove edge through store
      const { removeEdge } = useWorkflowStore.getState();
      removeEdge(sourceId, condition);
    }
  }, [editMode]);
  
  if (!currentWorkflow) {
    return (
      <div className={styles.emptyState}>
        <p>No workflow loaded</p>
        <p>Select a directory and choose a workflow file to view</p>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={editMode ? onNodesChange : undefined}
        onEdgesChange={editMode ? onEdgesChange : undefined}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        connectionLineStyle={connectionLineStyle}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        nodesDraggable={editMode}
        nodesConnectable={editMode}
        elementsSelectable={true}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      
      {editMode && (
        <div className={styles.hint}>
          💡 Drag from node handles to create edges. Double-click edges to delete.
        </div>
      )}
    </div>
  );
}
```

### Step 6: Integrate Edge Editor into Step Inspector

Update `components/step-inspector/index.tsx` to include EdgeEditor:

```typescript
// Add import
import { EdgeEditor } from '@/components/edge-editor';

// In the component, add a section for edges:
{editMode && selectedStep && (
  <div className={styles.section}>
    <EdgeEditor step={selectedStep} />
  </div>
)}
```

### Step 7: Create Tests for Edge Management

Create `lib/workflow-core/api.edges.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { addEdge, updateEdge, removeEdge } from './api';
import type { Flow } from './generated';

describe('Edge Management', () => {
  const baseWorkflow: Flow = {
    schema: 'flowspec.v1',
    id: 'test.workflow.v1',
    title: 'Test Workflow',
    owner: 'test@example.com',
    steps: [
      {
        id: 'step1',
        role: 'human',
        instructions: ['Do something'],
        acceptance: ['It is done']
      },
      {
        id: 'step2',
        role: 'ai',
        instructions: ['Process'],
        acceptance: ['Processed']
      },
      {
        id: 'step3',
        role: 'system',
        instructions: ['Verify'],
        acceptance: ['Verified']
      }
    ]
  };

  describe('addEdge', () => {
    it('should add edge between steps', () => {
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'success');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual({ success: 'step2' });
    });

    it('should validate condition format', () => {
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'Success-Case');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('lowercase with underscores');
    });

    it('should prevent duplicate conditions', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = addEdge(workflow, 'step1', 'step3', 'success');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already exists');
    });

    it('should detect circular dependencies', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { done: 'step2' };
      workflow.steps![1].next = { done: 'step3' };
      workflow.steps![2].next = { done: 'step1' };
      
      const result = addEdge(workflow, 'step3', 'step1', 'loop');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('circular dependency');
    });
  });

  describe('updateEdge', () => {
    it('should update edge condition', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = updateEdge(workflow, 'step1', 'success', 'approved');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual({ approved: 'step2' });
    });

    it('should update edge target', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = updateEdge(workflow, 'step1', 'success', 'success', 'step3');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual({ success: 'step3' });
    });
  });

  describe('removeEdge', () => {
    it('should remove edge by condition', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { 
        success: 'step2',
        failure: 'step3'
      };
      
      const result = removeEdge(workflow, 'step1', 'success');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual({ failure: 'step3' });
    });

    it('should remove next object if no edges remain', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = removeEdge(workflow, 'step1', 'success');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toBeUndefined();
    });
  });
});
```

### Step 8: Create Acceptance Test

Create `scripts/verify-edge-management.py`:

```python
#!/usr/bin/env python3
import os
import sys
import subprocess

def check_file_exists(filepath):
    """Check if a file exists"""
    if not os.path.exists(filepath):
        print(f"❌ Missing file: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_api_functions():
    """Check edge management functions"""
    api_file = 'lib/workflow-core/api.ts'
    with open(api_file, 'r') as f:
        content = f.read()
        functions = ['addEdge', 'updateEdge', 'removeEdge', 'wouldCreateCycle']
        for func in functions:
            if func not in content:
                print(f"❌ Missing function: {func}")
                return False
    print("✅ Edge management API functions implemented")
    return True

def check_edge_editor():
    """Check EdgeEditor component"""
    editor_file = 'components/edge-editor/index.tsx'
    with open(editor_file, 'r') as f:
        content = f.read()
        required = [
            'handleAddEdge',
            'handleUpdateEdge', 
            'handleRemoveEdge',
            'suggestCondition',
            'conditionPattern'
        ]
        for item in required:
            if item not in content:
                print(f"❌ EdgeEditor missing: {item}")
                return False
    print("✅ EdgeEditor component complete")
    return True

def check_graph_interactivity():
    """Check graph supports interactive edge creation"""
    graph_file = 'components/workflow-graph/index.tsx'
    with open(graph_file, 'r') as f:
        content = f.read()
        required = ['onConnect', 'onEdgeDoubleClick', 'nodesConnectable']
        for item in required:
            if item not in content:
                print(f"❌ Graph missing: {item}")
                return False
    print("✅ Graph supports interactive edges")
    return True

def check_store_methods():
    """Check workflow store has edge methods"""
    store_file = 'lib/state/workflow.store.ts'
    with open(store_file, 'r') as f:
        content = f.read()
        methods = ['addEdge:', 'updateEdge:', 'removeEdge:']
        for method in methods:
            if method not in content:
                print(f"❌ Store missing method: {method}")
                return False
    print("✅ Store edge methods implemented")
    return True

def run_tests():
    """Run edge management tests"""
    print("\nRunning edge tests...")
    result = subprocess.run(
        ['pnpm', 'test', 'api.edges.test'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print("❌ Edge tests failed")
        print(result.stdout)
        return False
    
    print("✅ Edge tests passing")
    return True

def main():
    checks = [
        check_file_exists('components/edge-editor/index.tsx'),
        check_file_exists('components/edge-editor/edge-editor.module.css'),
        check_api_functions(),
        check_edge_editor(),
        check_graph_interactivity(),
        check_store_methods(),
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Edge Management implementation complete!")
        print("Users can now:")
        print("- Create edges by dragging between nodes")
        print("- Edit edge conditions and targets")
        print("- Delete edges by double-clicking")
        print("- Use the edge editor panel")
        print("- See validation for circular dependencies")
        sys.exit(0)
    else:
        print("\n❌ Edge Management implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria

- [ ] Drag from node to node creates new edge (in edit mode)
- [ ] Prompt appears for condition name
- [ ] Condition format validated (lowercase with underscores)
- [ ] Double-click on edge deletes it (in edit mode)
- [ ] Edge editor panel shows all edges for selected step
- [ ] Can edit condition names inline
- [ ] Can change edge targets via dropdown
- [ ] Suggest button provides common conditions
- [ ] Circular dependency detection prevents invalid edges
- [ ] Graph updates immediately when edges change
- [ ] Edges preserved when saving workflow
- [ ] Tests pass for edge operations
- [ ] Edge labels show condition names clearly