# Task 2.1: Node Inspector UI

## Objective
Create a sidebar panel that displays step details when a node is selected in the graph, preparing for editing capabilities.

## Prerequisites
- Phase 1 completed (workflow viewer working)
- React Flow graph rendering
- Workflow stored in Zustand state

## Implementation Steps

### Step 1: Extend Workflow Store for Selection
Update `lib/state/workflow.store.ts`:
```typescript
'use client';

import { create } from 'zustand';
import type { Flow, Step, ValidationError } from '@/lib/workflow-core';

interface WorkflowState {
  currentWorkflow: Flow | null;
  validationErrors: ValidationError[];
  isValid: boolean;
  selectedStepId: string | null;
  selectedStep: Step | null;
  editMode: boolean;
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
  selectStep: (stepId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  validationErrors: [],
  isValid: false,
  selectedStepId: null,
  selectedStep: null,
  editMode: false,
  
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0
  }),
  
  clearWorkflow: () => set({
    currentWorkflow: null,
    validationErrors: [],
    isValid: false,
    selectedStepId: null,
    selectedStep: null,
    editMode: false
  }),
  
  selectStep: (stepId) => {
    const state = get();
    const step = stepId && state.currentWorkflow?.steps 
      ? state.currentWorkflow.steps.find(s => s.id === stepId)
      : null;
    
    set({
      selectedStepId: stepId,
      selectedStep: step || null
    });
  },
  
  setEditMode: (enabled) => set({ editMode: enabled })
}));
```

### Step 2: Create Step Inspector Component (Read-Only First)
Create `components/step-inspector/index.tsx`:
```typescript
'use client';

import { useWorkflowStore } from '@/lib/state/workflow.store';
import styles from './step-inspector.module.css';

export function StepInspector() {
  const { selectedStep, selectedStepId, editMode } = useWorkflowStore();

  if (!selectedStep) {
    return (
      <div className={styles.inspector}>
        <div className={styles.emptyState}>
          <p>Select a step to view its details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inspector}>
      <div className={styles.header}>
        <h3>Step Details</h3>
        {selectedStepId && <code className={styles.stepId}>{selectedStepId}</code>}
      </div>

      <div className={styles.content}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h4>Basic Information</h4>
          <div className={styles.field}>
            <label>Title</label>
            <div className={styles.value}>{selectedStep.title || 'Untitled'}</div>
          </div>
          <div className={styles.field}>
            <label>Role</label>
            <div className={styles.value}>{selectedStep.role || 'Not specified'}</div>
          </div>
          {selectedStep.desc && (
            <div className={styles.field}>
              <label>Description</label>
              <div className={styles.value}>{selectedStep.desc}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {selectedStep.instructions && selectedStep.instructions.length > 0 && (
          <div className={styles.section}>
            <h4>Instructions ({selectedStep.instructions.length})</h4>
            <ol className={styles.instructionsList}>
              {selectedStep.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Acceptance Criteria */}
        {selectedStep.acceptance?.checks && selectedStep.acceptance.checks.length > 0 && (
          <div className={styles.section}>
            <h4>Acceptance Criteria ({selectedStep.acceptance.checks.length})</h4>
            <ul className={styles.checksList}>
              {selectedStep.acceptance.checks.map((check, index) => (
                <li key={index}>
                  {check.kind && <span className={styles.checkKind}>[{check.kind}]</span>}
                  {check.description || check.path || check.expr || 'Check defined'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Token Scope */}
        {selectedStep.token && (
          <div className={styles.section}>
            <h4>Token Scope</h4>
            <div className={styles.tokenInfo}>
              {selectedStep.token.advisory && (
                <div className={styles.advisory}>Advisory mode</div>
              )}
              {selectedStep.token.scope && (
                <div className={styles.scope}>
                  {Object.entries(selectedStep.token.scope).map(([key, value]) => (
                    <div key={key} className={styles.scopeItem}>
                      <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {selectedStep.next && selectedStep.next.length > 0 && (
          <div className={styles.section}>
            <h4>Next Steps</h4>
            <ul className={styles.nextList}>
              {selectedStep.next.map((next, index) => (
                <li key={index}>
                  → {next.to}
                  {next.when && <span className={styles.condition}> (when: {next.when})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 3: Create Inspector Styles
Create `components/step-inspector/step-inspector.module.css`:
```css
.inspector {
  height: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.emptyState {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  padding: 20px;
  text-align: center;
}

.header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.stepId {
  font-size: 12px;
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 3px;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.section {
  margin-bottom: 25px;
}

.section:last-child {
  margin-bottom: 0;
}

.section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 5px;
}

.field {
  margin-bottom: 12px;
}

.field label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.value {
  font-size: 14px;
  color: #333;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  min-height: 36px;
}

.instructionsList,
.checksList,
.nextList {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.instructionsList li,
.checksList li,
.nextList li {
  margin-bottom: 8px;
}

.checkKind {
  font-size: 11px;
  background: #0070f3;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 8px;
}

.tokenInfo {
  font-size: 13px;
}

.advisory {
  background: #fff3cd;
  color: #856404;
  padding: 4px 8px;
  border-radius: 3px;
  margin-bottom: 8px;
  display: inline-block;
}

.scope {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.scopeItem {
  margin-bottom: 4px;
  font-family: monospace;
  font-size: 12px;
}

.condition {
  color: #666;
  font-style: italic;
  font-size: 12px;
}
```

### Step 4: Update Workflow Graph to Handle Selection
Update `components/workflow-graph/index.tsx`:
```typescript
'use client';

import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
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
    () => convertFlowToNodes(workflow),
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
        <Background variant="dots" gap={12} size={1} />
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
```

### Step 5: Update Main Layout to Include Inspector
Update `app/page.tsx`:
```typescript
import { DirectorySelector } from '@/components/directory-selector';
import { FileList } from '@/components/file-list';
import { WorkflowLoader } from '@/components/workflow-loader';
import { WorkflowViewer } from '@/components/workflow-viewer';
import { StepInspector } from '@/components/step-inspector';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Workflow Builder</h1>
        <DirectorySelector />
        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <FileList />
            <WorkflowLoader />
          </div>
          <div className={styles.canvas}>
            <WorkflowViewer />
          </div>
          <div className={styles.inspector}>
            <StepInspector />
          </div>
        </div>
      </div>
    </main>
  );
}
```

### Step 6: Update Layout Styles
Update `app/page.module.css`:
```css
.layout {
  display: grid;
  grid-template-columns: 400px 1fr 400px;
  gap: 20px;
  margin-top: 20px;
  height: calc(100vh - 200px);
  min-height: 600px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.canvas {
  min-width: 0;
  height: 100%;
}

.inspector {
  min-width: 0;
  overflow-y: auto;
}

/* Add responsive behavior */
@media (max-width: 1400px) {
  .layout {
    grid-template-columns: 350px 1fr 350px;
  }
}
```

### Step 7: Update Step Node Style for Selection
Update `app/globals.css`:
```css
/* Add to existing step-node styles */
.step-node.selected {
  border-color: #ff0000;
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}
```

## Acceptance Tests

Create `scripts/verify-node-inspector.py`:
```python
#!/usr/bin/env python3
import os
import sys

def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_store_selection_methods():
    """Check that workflow store has selection methods"""
    store_file = 'lib/state/workflow.store.ts'
    required_items = [
        'selectedStepId:',
        'selectedStep:',
        'selectStep:',
        'editMode:',
        'setEditMode:'
    ]
    
    with open(store_file, 'r') as f:
        content = f.read()
        missing = []
        for item in required_items:
            if item not in content:
                missing.append(item)
        
        if missing:
            print(f"❌ Store missing: {', '.join(missing)}")
            return False
    
    print("✅ Store has selection methods")
    return True

def check_inspector_component():
    """Check inspector component exists and has correct structure"""
    inspector_file = 'components/step-inspector/index.tsx'
    if not os.path.exists(inspector_file):
        print(f"❌ Inspector component missing")
        return False
    
    with open(inspector_file, 'r') as f:
        content = f.read()
        required_elements = [
            'useWorkflowStore',
            'selectedStep',
            'Instructions',
            'Acceptance Criteria',
            'Token Scope'
        ]
        
        missing = []
        for element in required_elements:
            if element not in content:
                missing.append(element)
        
        if missing:
            print(f"❌ Inspector missing elements: {', '.join(missing)}")
            return False
    
    print("✅ Inspector component complete")
    return True

def check_graph_selection():
    """Check that graph handles selection"""
    graph_file = 'components/workflow-graph/index.tsx'
    with open(graph_file, 'r') as f:
        content = f.read()
        if 'selectStep' not in content:
            print(f"❌ Graph doesn't handle selection")
            return False
        if 'onNodeClick' not in content:
            print(f"❌ Graph missing node click handler")
            return False
    
    print("✅ Graph handles selection")
    return True

def check_layout_update():
    """Check that layout includes inspector"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'StepInspector' not in content:
            print(f"❌ Inspector not in layout")
            return False
    
    print("✅ Inspector integrated in layout")
    return True

def main():
    checks = [
        check_file_exists('components/step-inspector/index.tsx'),
        check_file_exists('components/step-inspector/step-inspector.module.css'),
        check_store_selection_methods(),
        check_inspector_component(),
        check_graph_selection(),
        check_layout_update()
    ]
    
    if all(checks):
        print("\n🎉 Node inspector implementation complete!")
        print("Users can now:")
        print("- Click on nodes to select them")
        print("- View step details in the inspector panel")
        print("- See all step information organized by section")
        sys.exit(0)
    else:
        print("\n❌ Node inspector implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria
- [ ] Clicking a node selects it and shows details in inspector
- [ ] Inspector displays all step information (title, role, instructions, etc.)
- [ ] Selected node is visually highlighted in the graph
- [ ] Clicking the background deselects the node
- [ ] Inspector shows empty state when no node is selected
- [ ] Layout accommodates the inspector panel
- [ ] All sections properly styled and readable
- [ ] Store tracks selected step state