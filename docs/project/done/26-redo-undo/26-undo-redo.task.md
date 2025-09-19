# Task 2.6: Undo/Redo Support (Optional)

## Objective

Implement undo/redo functionality to allow users to revert or replay their editing actions, improving the editing experience.

## Prerequisites

- All previous Phase 2 tasks completed (2.1-2.5)
- Workflow editing fully functional
- Save mechanism working

## Implementation Steps

### Step 1: Create History Manager

Create `lib/workflow-core/history-manager.ts`:

```typescript
import type { Flow } from './generated';

export interface HistoryState {
  workflow: Flow;
  timestamp: number;
  description: string;
}

export class WorkflowHistoryManager {
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;
  
  constructor(maxSize: number = 50) {
    this.maxHistorySize = maxSize;
  }
  
  /**
   * Add a new state to history
   */
  push(workflow: Flow, description: string = 'Edit'): void {
    // Remove any states after current index (branching)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add new state
    this.history.push({
      workflow: JSON.parse(JSON.stringify(workflow)), // Deep clone
      timestamp: Date.now(),
      description
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }
  
  /**
   * Undo to previous state
   */
  undo(): HistoryState | null {
    if (!this.canUndo()) {
      return null;
    }
    
    this.currentIndex--;
    return this.history[this.currentIndex];
  }
  
  /**
   * Redo to next state
   */
  redo(): HistoryState | null {
    if (!this.canRedo()) {
      return null;
    }
    
    this.currentIndex++;
    return this.history[this.currentIndex];
  }
  
  /**
   * Get current state
   */
  getCurrent(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }
  
  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
  
  /**
   * Get history information
   */
  getHistoryInfo(): {
    current: number;
    total: number;
    canUndo: boolean;
    canRedo: boolean;
    recentActions: string[];
  } {
    const recentActions = this.history
      .slice(Math.max(0, this.currentIndex - 2), this.currentIndex + 3)
      .map((state, index) => {
        const actualIndex = Math.max(0, this.currentIndex - 2) + index;
        const isCurrent = actualIndex === this.currentIndex;
        return `${isCurrent ? '→ ' : '  '}${state.description}`;
      });
    
    return {
      current: this.currentIndex + 1,
      total: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      recentActions
    };
  }
  
  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
  
  /**
   * Get a compressed representation for debugging
   */
  getDebugInfo(): string {
    return this.history.map((state, index) => {
      const marker = index === this.currentIndex ? '→' : ' ';
      const time = new Date(state.timestamp).toLocaleTimeString();
      return `${marker} [${index}] ${time}: ${state.description}`;
    }).join('\n');
  }
}

/**
 * Generate descriptive action names
 */
export function describeAction(
  action: string,
  details?: { stepId?: string; condition?: string; field?: string }
): string {
  const actionDescriptions: { [key: string]: string } = {
    'add_step': `Add step ${details?.stepId || 'new'}`,
    'remove_step': `Remove step ${details?.stepId || ''}`,
    'update_step': `Update step ${details?.stepId || ''}`,
    'duplicate_step': `Duplicate step ${details?.stepId || ''}`,
    'add_edge': `Add edge ${details?.condition || ''}`,
    'remove_edge': `Remove edge ${details?.condition || ''}`,
    'update_edge': `Update edge ${details?.condition || ''}`,
    'update_field': `Update ${details?.field || 'field'}`,
    'load': 'Load workflow',
    'reset': 'Reset changes'
  };
  
  return actionDescriptions[action] || action;
}
```

### Step 2: Integrate History into Workflow Store

Update `lib/state/workflow.store.ts`:

```typescript
import { WorkflowHistoryManager, describeAction } from '@/lib/workflow-core/history-manager';

interface WorkflowState {
  // ... existing properties
  history: WorkflowHistoryManager;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  getHistoryInfo: () => any;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // ... existing properties
  history: new WorkflowHistoryManager(),
  canUndo: false,
  canRedo: false,
  
  setWorkflow: (workflow, errors = []) => {
    const history = new WorkflowHistoryManager(); // New history for new workflow
    
    if (workflow) {
      history.push(workflow, 'Load workflow');
    }
    
    set({
      currentWorkflow: workflow,
      originalWorkflow: workflow ? JSON.parse(JSON.stringify(workflow)) : null,
      validationErrors: errors,
      isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0,
      isDirty: false,
      history,
      canUndo: history.canUndo(),
      canRedo: history.canRedo()
    });
  },
  
  updateWorkflow: (workflow, errors = [], actionDescription = 'Edit') => {
    const state = get();
    const isDirty = JSON.stringify(workflow) !== JSON.stringify(state.originalWorkflow);
    
    // Add to history
    state.history.push(workflow, actionDescription);
    
    set({
      currentWorkflow: workflow,
      validationErrors: errors,
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      isDirty,
      canUndo: state.history.canUndo(),
      canRedo: state.history.canRedo()
    });
  },
  
  undo: () => {
    const state = get();
    const previousState = state.history.undo();
    
    if (previousState) {
      const validation = validateWorkflow(previousState.workflow);
      const isDirty = JSON.stringify(previousState.workflow) !== 
                      JSON.stringify(state.originalWorkflow);
      
      set({
        currentWorkflow: previousState.workflow,
        validationErrors: validation,
        isValid: validation.filter(e => e.severity === 'error').length === 0,
        isDirty,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo()
      });
    }
  },
  
  redo: () => {
    const state = get();
    const nextState = state.history.redo();
    
    if (nextState) {
      const validation = validateWorkflow(nextState.workflow);
      const isDirty = JSON.stringify(nextState.workflow) !== 
                      JSON.stringify(state.originalWorkflow);
      
      set({
        currentWorkflow: nextState.workflow,
        validationErrors: validation,
        isValid: validation.filter(e => e.severity === 'error').length === 0,
        isDirty,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo()
      });
    }
  },
  
  getHistoryInfo: () => {
    const state = get();
    return state.history.getHistoryInfo();
  },
  
  // Update existing methods to include action descriptions
  updateStep: (stepId, updates) => {
    const state = get();
    if (!state.currentWorkflow || !state.currentWorkflow.steps) return;
    
    const stepIndex = state.currentWorkflow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    const updatedSteps = [...state.currentWorkflow.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], ...updates };
    
    const updatedWorkflow = { ...state.currentWorkflow, steps: updatedSteps };
    const validation = validateWorkflow(updatedWorkflow);
    
    state.updateWorkflow(
      updatedWorkflow,
      validation,
      describeAction('update_step', { stepId })
    );
  },
  
  addStep: (step, position) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = addStep(state.currentWorkflow, step, position);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(
        result.data,
        validation,
        describeAction('add_step', { stepId: step.id })
      );
    }
  },
  
  removeStep: (stepId) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    if (state.selectedStepId === stepId) {
      state.selectStep(null);
    }
    
    const result = removeStep(state.currentWorkflow, stepId);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(
        result.data,
        validation,
        describeAction('remove_step', { stepId })
      );
    }
  },
  
  // ... similar updates for other methods
}));
```

### Step 3: Create Undo/Redo UI Component

Create `components/undo-redo/index.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import styles from './undo-redo.module.css';

export function UndoRedoControls() {
  const { 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    editMode,
    getHistoryInfo 
  } = useWorkflowStore();
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyInfo, setHistoryInfo] = useState<any>(null);
  
  useEffect(() => {
    if (showHistory) {
      const info = getHistoryInfo();
      setHistoryInfo(info);
    }
  }, [showHistory, canUndo, canRedo, getHistoryInfo]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editMode) return;
      
      // Ctrl/Cmd + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if ((e.metaKey || e.ctrlKey) && (
        (e.key === 'z' && e.shiftKey) || 
        e.key === 'y'
      )) {
        e.preventDefault();
        if (canRedo) redo();
      }
      
      // Ctrl/Cmd + H for history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, canUndo, canRedo, undo, redo]);
  
  if (!editMode) {
    return null;
  }
  
  return (
    <>
      <div className={styles.container}>
        <button
          className={styles.button}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          ↶
        </button>
        
        <button
          className={styles.button}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          ↷
        </button>
        
        <button
          className={`${styles.button} ${styles.historyButton}`}
          onClick={() => setShowHistory(!showHistory)}
          title="Show History (Ctrl+H)"
          aria-label="History"
        >
          📜
        </button>
      </div>
      
      {showHistory && historyInfo && (
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <span>History ({historyInfo.current}/{historyInfo.total})</span>
            <button
              className={styles.closeButton}
              onClick={() => setShowHistory(false)}
            >
              ×
            </button>
          </div>
          
          <div className={styles.historyList}>
            {historyInfo.recentActions.map((action: string, index: number) => (
              <div
                key={index}
                className={`${styles.historyItem} ${
                  action.startsWith('→') ? styles.currentItem : ''
                }`}
              >
                {action}
              </div>
            ))}
          </div>
          
          <div className={styles.historyFooter}>
            <small>Use Ctrl+Z/Y to navigate</small>
          </div>
        </div>
      )}
    </>
  );
}
```

### Step 4: Create Undo/Redo Styles

Create `components/undo-redo/undo-redo.module.css`:

```css
.container {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  color: #333;
}

.button:hover:not(:disabled) {
  background: #e0e0e0;
  transform: scale(1.05);
}

.button:active:not(:disabled) {
  transform: scale(0.95);
}

.button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.historyButton {
  font-size: 16px;
}

.historyPanel {
  position: absolute;
  top: 50px;
  left: 8px;
  width: 250px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.historyHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
  font-size: 14px;
}

.closeButton {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.historyList {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
}

.historyItem {
  padding: 6px 8px;
  font-size: 13px;
  color: #666;
  border-radius: 4px;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.currentItem {
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 500;
}

.historyFooter {
  padding: 8px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  font-size: 11px;
  color: #999;
}
```

### Step 5: Update Layout to Include Undo/Redo

Update `app/page.tsx`:

```typescript
import { UndoRedoControls } from '@/components/undo-redo';

// In the toolbar section:
<div className={styles.toolbar}>
  <DirectoryPicker />
  <WorkflowLoader />
  <UndoRedoControls />
  <SaveButton />
  <ValidationStatus />
</div>
```

### Step 6: Create History Manager Tests

Create `lib/workflow-core/history-manager.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowHistoryManager } from './history-manager';
import type { Flow } from './generated';

describe('WorkflowHistoryManager', () => {
  let manager: WorkflowHistoryManager;
  
  const createWorkflow = (id: string): Flow => ({
    schema: 'flowspec.v1',
    id,
    title: `Workflow ${id}`,
    owner: 'test@example.com',
    steps: []
  });
  
  beforeEach(() => {
    manager = new WorkflowHistoryManager(5); // Small size for testing
  });
  
  describe('push', () => {
    it('should add states to history', () => {
      const w1 = createWorkflow('w1');
      const w2 = createWorkflow('w2');
      
      manager.push(w1, 'Initial');
      manager.push(w2, 'Edit');
      
      const info = manager.getHistoryInfo();
      expect(info.total).toBe(2);
      expect(info.current).toBe(2);
    });
    
    it('should limit history size', () => {
      for (let i = 0; i < 10; i++) {
        manager.push(createWorkflow(`w${i}`), `Edit ${i}`);
      }
      
      const info = manager.getHistoryInfo();
      expect(info.total).toBe(5); // Limited to maxSize
    });
    
    it('should clear future history on branch', () => {
      manager.push(createWorkflow('w1'), 'Step 1');
      manager.push(createWorkflow('w2'), 'Step 2');
      manager.push(createWorkflow('w3'), 'Step 3');
      
      manager.undo();
      manager.undo();
      
      manager.push(createWorkflow('w4'), 'New branch');
      
      const info = manager.getHistoryInfo();
      expect(info.total).toBe(2); // w1 and w4
      expect(info.canRedo).toBe(false);
    });
  });
  
  describe('undo/redo', () => {
    it('should navigate through history', () => {
      const w1 = createWorkflow('w1');
      const w2 = createWorkflow('w2');
      const w3 = createWorkflow('w3');
      
      manager.push(w1, 'First');
      manager.push(w2, 'Second');
      manager.push(w3, 'Third');
      
      expect(manager.getCurrent()?.workflow.id).toBe('w3');
      
      manager.undo();
      expect(manager.getCurrent()?.workflow.id).toBe('w2');
      
      manager.undo();
      expect(manager.getCurrent()?.workflow.id).toBe('w1');
      
      manager.redo();
      expect(manager.getCurrent()?.workflow.id).toBe('w2');
    });
    
    it('should respect boundaries', () => {
      manager.push(createWorkflow('w1'), 'Only');
      
      expect(manager.canUndo()).toBe(false);
      expect(manager.undo()).toBeNull();
      
      manager.push(createWorkflow('w2'), 'Second');
      expect(manager.canUndo()).toBe(true);
      expect(manager.canRedo()).toBe(false);
      
      manager.undo();
      expect(manager.canRedo()).toBe(true);
    });
  });
  
  describe('getHistoryInfo', () => {
    it('should provide accurate history information', () => {
      manager.push(createWorkflow('w1'), 'Load');
      manager.push(createWorkflow('w2'), 'Add step');
      manager.push(createWorkflow('w3'), 'Remove step');
      
      manager.undo();
      
      const info = manager.getHistoryInfo();
      expect(info.current).toBe(2);
      expect(info.total).toBe(3);
      expect(info.canUndo).toBe(true);
      expect(info.canRedo).toBe(true);
      expect(info.recentActions).toContain('→ Add step');
    });
  });
});
```

### Step 7: Create Acceptance Test

Create `scripts/verify-undo-redo.py`:

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

def check_history_manager():
    """Check history manager implementation"""
    manager_file = 'lib/workflow-core/history-manager.ts'
    with open(manager_file, 'r') as f:
        content = f.read()
        required = [
            'WorkflowHistoryManager',
            'push', 'undo', 'redo',
            'canUndo', 'canRedo',
            'getHistoryInfo',
            'describeAction'
        ]
        for item in required:
            if item not in content:
                print(f"❌ History manager missing: {item}")
                return False
    print("✅ History manager implemented")
    return True

def check_store_integration():
    """Check store has undo/redo methods"""
    store_file = 'lib/state/workflow.store.ts'
    with open(store_file, 'r') as f:
        content = f.read()
        required = [
            'history:', 'canUndo:', 'canRedo:',
            'undo:', 'redo:', 'getHistoryInfo:'
        ]
        for item in required:
            if item not in content:
                print(f"❌ Store missing: {item}")
                return False
    print("✅ Store integrated with history")
    return True

def check_ui_component():
    """Check UndoRedo component"""
    component_file = 'components/undo-redo/index.tsx'
    with open(component_file, 'r') as f:
        content = f.read()
        required = [
            'UndoRedoControls',
            'Ctrl+Z', 'Ctrl+Shift+Z',
            'showHistory',
            'historyInfo'
        ]
        for item in required:
            if item not in content:
                print(f"❌ UI component missing: {item}")
                return False
    print("✅ Undo/Redo UI component complete")
    return True

def check_keyboard_shortcuts():
    """Check keyboard shortcut handling"""
    component_file = 'components/undo-redo/index.tsx'
    with open(component_file, 'r') as f:
        content = f.read()
        shortcuts = [
            'e.key === \'z\'',
            'e.key === \'y\'',
            'e.metaKey || e.ctrlKey',
            'e.shiftKey'
        ]
        for shortcut in shortcuts:
            if shortcut not in content:
                print(f"❌ Missing keyboard shortcut: {shortcut}")
                return False
    print("✅ Keyboard shortcuts implemented")
    return True

def run_tests():
    """Run history manager tests"""
    print("\nRunning history tests...")
    result = subprocess.run(
        ['pnpm', 'test', 'history-manager.test'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print("❌ History tests failed")
        print(result.stdout)
        return False
    
    print("✅ History tests passing")
    return True

def main():
    checks = [
        check_file_exists('lib/workflow-core/history-manager.ts'),
        check_file_exists('components/undo-redo/index.tsx'),
        check_file_exists('components/undo-redo/undo-redo.module.css'),
        check_history_manager(),
        check_store_integration(),
        check_ui_component(),
        check_keyboard_shortcuts(),
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Undo/Redo implementation complete!")
        print("Users can now:")
        print("- Undo changes with Ctrl+Z")
        print("- Redo changes with Ctrl+Y or Ctrl+Shift+Z")
        print("- View history panel with Ctrl+H")
        print("- See visual indicators for undo/redo availability")
        print("- Navigate through edit history")
        print("- Branch from any point in history")
        sys.exit(0)
    else:
        print("\n❌ Undo/Redo implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria

- [ ] Undo button enabled when history exists
- [ ] Redo button enabled after undo
- [ ] Ctrl+Z triggers undo
- [ ] Ctrl+Y or Ctrl+Shift+Z triggers redo
- [ ] History panel shows recent actions
- [ ] Current action highlighted in history
- [ ] Can navigate to any point in history
- [ ] Branching works (new edits clear future history)
- [ ] History limited to reasonable size (50 entries)
- [ ] Action descriptions are meaningful
- [ ] History persists during session
- [ ] History clears when loading new workflow
- [ ] Visual feedback for keyboard shortcuts
- [ ] Tests pass for history manager

## Implementation Notes

1. **Memory Management**: History stores deep clones, so limit size to prevent memory issues
1. **Action Descriptions**: Use meaningful descriptions for better UX
1. **Keyboard Shortcuts**: Standard shortcuts (Ctrl+Z/Y) for familiarity
1. **Visual Feedback**: Clear indicators for can/cannot undo/redo
1. **History Panel**: Optional UI for power users to see history
1. **Performance**: Consider debouncing for rapid changes
1. **Branching**: New edits from middle of history create a new branch

This completes the optional but valuable undo/redo functionality, significantly improving the editing experience for users working with complex workflows.