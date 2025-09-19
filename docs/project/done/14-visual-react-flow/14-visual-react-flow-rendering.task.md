# Task 1.4: Visual React Flow Rendering (FIXED)

## Objective
Create a React Flow component that takes the validated Flow object and renders it as an interactive visual graph (read-only).

## Prerequisites
- Task 1.3 completed (workflow parsing and validation)
- reactflow package installed
- Flow object available in state

## Implementation Steps

### Step 1: Create Workflow State Store
Create `lib/state/workflow.store.ts`:
```typescript
'use client';

import { create } from 'zustand';
import type { Flow, ValidationError } from '@/lib/workflow-core';

interface WorkflowState {
  currentWorkflow: Flow | null;
  validationErrors: ValidationError[];
  isValid: boolean;
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  currentWorkflow: null,
  validationErrors: [],
  isValid: false,
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0
  }),
  clearWorkflow: () => set({
    currentWorkflow: null,
    validationErrors: [],
    isValid: false
  })
}));
```

### Step 2: Create Flow-to-Node Converter
Create `lib/workflow-core/flow-to-nodes.ts`:
```typescript
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
  
  // Calculate node positions (simple vertical layout)
  const nodeWidth = 250;
  const nodeHeight = 120;
  const horizontalSpacing = 100;
  const verticalSpacing = 150;
  
  // Create nodes from steps
  workflow.steps.forEach((step, index) => {
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
  workflow.steps.forEach((step, index) => {
    const currentId = step.id || `step_${index}`;
    
    if (step.next && step.next.length > 0) {
      // Explicit next steps
      step.next.forEach((nextStep, nextIndex) => {
        edges.push({
          id: `${currentId}->${nextStep.to}-${nextIndex}`,
          source: currentId,
          target: nextStep.to,
          label: nextStep.when || undefined,
          type: 'smoothstep',
          animated: false
        });
      });
    } else if (index < workflow.steps.length - 1) {
      // Implicit sequential flow to next step
      const nextId = workflow.steps[index + 1].id || `step_${index + 1}`;
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
```

### Step 3: Create Custom Step Node Component
Create `components/workflow-graph/step-node.tsx`:
```typescript
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
```

### Step 4: Create Workflow Graph Component (WITH FIXES)
Create `components/workflow-graph/index.tsx`:
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
// NOTE: CSS import moved to app/layout.tsx!
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
        <Background variant="dots" gap={12} size={1} />
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
```

### Step 5: Update Layout to Import React Flow CSS
Update `app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'reactflow/dist/style.css'; // FIX: React Flow CSS must be here!

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Workflow Builder',
  description: 'Visual workflow editor for flowspec.v1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Step 6: Update Workflow Loader to Use Store
Update `components/workflow-loader.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { loadWorkflow } from '@/lib/workflow-core';

export function WorkflowLoader() {
  const { selectedFile, fileContent } = useFileSystemStore();
  const { setWorkflow, clearWorkflow, currentWorkflow, validationErrors } = useWorkflowStore();
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fileContent && selectedFile) {
      parseWorkflow();
    } else {
      clearWorkflow();
      setParseError(null);
    }
  }, [fileContent, selectedFile]);

  const parseWorkflow = async () => {
    if (!fileContent) return;

    setIsLoading(true);
    setParseError(null);

    const result = await loadWorkflow(fileContent);

    if (result.success) {
      // Also run validation to get warnings
      const { validateWorkflow } = await import('@/lib/workflow-core');
      const errors = await validateWorkflow(result.data);
      setWorkflow(result.data, errors);
    } else {
      clearWorkflow();
      setParseError(result.error.message);
    }

    setIsLoading(false);
  };

  if (!selectedFile) {
    return null;
  }

  return (
    <div className="workflow-loader">
      <h3>Workflow Status</h3>
      
      {isLoading && (
        <div className="loading">Parsing workflow...</div>
      )}

      {parseError && (
        <div className="parse-error">
          <h4>❌ Parse Error</h4>
          <pre>{parseError}</pre>
        </div>
      )}

      {currentWorkflow && (
        <div className="workflow-info">
          <h4>✅ Valid Workflow</h4>
          <dl>
            <dt>ID:</dt>
            <dd>{currentWorkflow.id}</dd>
            <dt>Title:</dt>
            <dd>{currentWorkflow.title}</dd>
            <dt>Steps:</dt>
            <dd>{currentWorkflow.steps?.length || 0}</dd>
            <dt>Policy:</dt>
            <dd>{currentWorkflow.policy?.enforcement || 'none'}</dd>
          </dl>
        </div>
      )}

      {validationErrors.filter(e => e.severity === 'warning').length > 0 && (
        <div className="validation-warnings">
          <h4>⚠️ Warnings</h4>
          <ul>
            {validationErrors.filter(e => e.severity === 'warning').map((error, index) => (
              <li key={index}>
                <strong>{error.path}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Step 7: Create Graph Container Component
Create `components/workflow-viewer.tsx`:
```typescript
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
```

### Step 8: Update Main Layout
Update `app/page.tsx`:
```typescript
import { DirectorySelector } from '@/components/directory-selector';
import { FileList } from '@/components/file-list';
import { WorkflowLoader } from '@/components/workflow-loader';
import { WorkflowViewer } from '@/components/workflow-viewer';
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
        </div>
      </div>
    </main>
  );
}
```

### Step 9: Add Styles
Update `app/globals.css`:
```css
/* Add to existing globals.css */

.workflow-graph-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.step-node {
  background: white;
  border: 2px solid #0070f3;
  border-radius: 8px;
  padding: 10px;
  min-width: 200px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.step-node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.step-id {
  font-family: monospace;
  font-size: 12px;
  color: #666;
}

.token-badge {
  font-size: 12px;
}

.step-node-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
}

.step-node-role {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.step-node-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
}

.workflow-viewer {
  width: 100%;
  height: 100%;
}

.workflow-viewer-empty,
.workflow-viewer-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
}

.workflow-viewer-error {
  color: #c00;
}
```

Update `app/page.module.css`:
```css
/* Update existing page.module.css */

.layout {
  display: grid;
  grid-template-columns: 400px 1fr;
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
```

### Step 10: Create Tests
Create `lib/workflow-core/flow-to-nodes.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { convertFlowToNodes } from './flow-to-nodes';
import type { Flow } from './generated';

describe('Flow to Nodes Converter', () => {
  it('should convert steps to nodes', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        {
          id: 'step_one',
          title: 'First Step',
          role: 'human',
          instructions: ['Do this'],
          acceptance: { checks: [] }
        },
        {
          id: 'step_two',
          title: 'Second Step',
          role: 'ai',
          instructions: ['Do that'],
          acceptance: { checks: [] }
        }
      ]
    } as Flow;

    const { nodes, edges } = convertFlowToNodes(workflow);
    
    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe('step_one');
    expect(nodes[1].id).toBe('step_two');
    
    // Should have implicit edge between sequential steps
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('step_one');
    expect(edges[0].target).toBe('step_two');
  });

  it('should handle explicit next steps', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        {
          id: 'step_one',
          next: [{ to: 'step_three' }]
        },
        { id: 'step_two' },
        { id: 'step_three' }
      ]
    } as Flow;

    const { edges } = convertFlowToNodes(workflow);
    
    const explicitEdge = edges.find(e => e.source === 'step_one');
    expect(explicitEdge?.target).toBe('step_three');
  });

  it('should handle empty workflow', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: []
    } as Flow;

    const { nodes, edges } = convertFlowToNodes(workflow);
    
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });
});
```

## Acceptance Tests

Create `scripts/verify-visual-rendering.py`:
```python
#!/usr/bin/env python3
import os
import sys
import subprocess

def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_no_css_import_in_component():
    """Check that component does NOT import React Flow CSS"""
    graph_file = 'components/workflow-graph/index.tsx'
    if os.path.exists(graph_file):
        with open(graph_file, 'r') as f:
            content = f.read()
            if "import 'reactflow/dist/style.css'" in content:
                print(f"❌ React Flow CSS should NOT be imported in component")
                return False
    print("✅ React Flow CSS not in component (correct)")
    return True

def check_css_import_in_layout():
    """Check that layout imports React Flow CSS"""
    layout_file = 'app/layout.tsx'
    with open(layout_file, 'r') as f:
        content = f.read()
        if "import 'reactflow/dist/style.css'" not in content:
            print(f"❌ React Flow CSS missing from layout.tsx")
            return False
    print("✅ React Flow CSS imported in layout.tsx")
    return True

def check_state_sync():
    """Check that graph has useEffect for state sync"""
    graph_file = 'components/workflow-graph/index.tsx'
    with open(graph_file, 'r') as f:
        content = f.read()
        if 'useEffect' not in content:
            print(f"❌ Missing useEffect import")
            return False
        if 'setNodes(initialNodes)' not in content:
            print(f"❌ Missing state sync in useEffect")
            return False
    print("✅ Graph state sync implemented")
    return True

def check_store_integration():
    """Check that workflow store is used"""
    loader_file = 'components/workflow-loader.tsx'
    with open(loader_file, 'r') as f:
        content = f.read()
        if 'useWorkflowStore' not in content:
            print(f"❌ WorkflowLoader not using workflow store")
            return False
    
    print("✅ Workflow store integrated")
    return True

def check_layout_update():
    """Check that main page has graph viewer"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'WorkflowViewer' not in content:
            print(f"❌ WorkflowViewer not in main page")
            return False
        # Should NOT have 'use client'
        first_line = content.split('\n')[0]
        if first_line.strip() == "'use client';":
            print(f"❌ app/page.tsx should NOT have 'use client' directive")
            return False
    
    print("✅ WorkflowViewer integrated in layout")
    print("✅ app/page.tsx has no 'use client' directive")
    return True

def run_tests():
    """Run flow-to-nodes tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/workflow-core/flow-to-nodes.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Flow-to-nodes tests pass")
        return True
    
    print(f"❌ Tests failed")
    return False

def main():
    checks = [
        # Check new files exist
        check_file_exists('lib/state/workflow.store.ts'),
        check_file_exists('lib/workflow-core/flow-to-nodes.ts'),
        check_file_exists('components/workflow-graph/index.tsx'),
        check_file_exists('components/workflow-graph/step-node.tsx'),
        check_file_exists('components/workflow-viewer.tsx'),
        check_file_exists('lib/workflow-core/flow-to-nodes.test.ts'),
        
        # Check React Flow CSS fixes
        check_no_css_import_in_component(),
        check_css_import_in_layout(),
        
        # Check state sync fix
        check_state_sync(),
        
        # Check store usage
        check_store_integration(),
        
        # Check layout
        check_layout_update(),
        
        # Run tests
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Visual rendering implementation complete!")
        print("Workflows are now displayed as interactive graphs.")
        print("\nPhase 1 (Read-Only Viewer) is COMPLETE!")
        print("\nYou can now:")
        print("1. Select a directory")
        print("2. Choose a .flow.yaml file")
        print("3. See validation results")
        print("4. View the workflow as a visual graph")
        sys.exit(0)
    else:
        print("\n❌ Visual rendering implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria
- [ ] Workflow steps are rendered as nodes
- [ ] Edges connect steps based on flow logic
- [ ] Custom step nodes show id, title, role
- [ ] Token badge appears for steps with tokens
- [ ] Instruction and check counts are displayed
- [ ] Graph has pan, zoom, and minimap controls
- [ ] Read-only mode prevents editing
- [ ] Empty state shown when no workflow selected
- [ ] Error state shown for invalid workflows
- [ ] React Flow CSS imported in layout.tsx (NOT in component)
- [ ] Graph updates when switching files (useEffect sync)
- [ ] Tests pass for node conversion logic

## Key Fixes Applied
1. ✅ React Flow CSS import moved to `app/layout.tsx`
2. ✅ Added `useEffect` to sync nodes/edges when workflow changes
3. ✅ No `'use client'` in `app/page.tsx`
4. ✅ All paths use root structure (no `src/` directory)