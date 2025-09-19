# Task 2.4: Add/Remove Steps

## Objective

Enable users to add new steps to the workflow and remove existing steps, maintaining workflow integrity and validation.

## Prerequisites

- Tasks 2.1, 2.2, and 2.3 completed
- Node inspector and live editing working
- Save functionality operational
- Workflow validation running on changes

## Implementation Steps

### Step 1: Implement Core API Functions for Step Management

Update `lib/workflow-core/api.ts` to implement add/remove functions:

```typescript
export function addStep(
  workflow: Flow,
  step: Step,
  position?: number
): Result<Flow> {
  try {
    // Validate the new step has required fields
    if (!step.id || !step.role || !step.instructions || !step.acceptance) {
      return {
        success: false,
        error: new Error('Step missing required fields: id, role, instructions, acceptance')
      };
    }

    // Validate step ID format
    const idPattern = /^[a-z][a-z0-9_]*$/;
    if (!idPattern.test(step.id)) {
      return {
        success: false,
        error: new Error('Step ID must be lowercase with underscores only')
      };
    }

    // Check for duplicate ID
    if (workflow.steps?.some(s => s.id === step.id)) {
      return {
        success: false,
        error: new Error(`Step with ID "${step.id}" already exists`)
      };
    }

    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    if (!updatedWorkflow.steps) {
      updatedWorkflow.steps = [];
    }

    // Insert at position or append
    if (position !== undefined && position >= 0 && position <= updatedWorkflow.steps.length) {
      updatedWorkflow.steps.splice(position, 0, step);
    } else {
      updatedWorkflow.steps.push(step);
    }

    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to add step')
    };
  }
}

export function removeStep(
  workflow: Flow,
  stepId: string
): Result<Flow> {
  try {
    if (!workflow.steps) {
      return {
        success: false,
        error: new Error('Workflow has no steps')
      };
    }

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    
    if (stepIndex === -1) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    // Remove the step
    updatedWorkflow.steps!.splice(stepIndex, 1);
    
    // Clean up references to this step in other steps' next conditions
    if (updatedWorkflow.steps) {
      updatedWorkflow.steps = updatedWorkflow.steps.map(step => {
        if (step.next) {
          // Filter out any next conditions that point to the removed step
          const filteredNext: { [key: string]: string } = {};
          for (const [condition, targetId] of Object.entries(step.next)) {
            if (targetId !== stepId) {
              filteredNext[condition] = targetId;
            }
          }
          // Only keep next if it has remaining conditions
          if (Object.keys(filteredNext).length > 0) {
            return { ...step, next: filteredNext };
          } else {
            // Remove next entirely if no conditions remain
            const { next, ...stepWithoutNext } = step;
            return stepWithoutNext;
          }
        }
        return step;
      });
    }

    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to remove step')
    };
  }
}

export function duplicateStep(
  workflow: Flow,
  stepId: string,
  newId: string
): Result<Flow> {
  try {
    const step = workflow.steps?.find(s => s.id === stepId);
    
    if (!step) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    // Create a copy with new ID
    const duplicatedStep: Step = {
      ...JSON.parse(JSON.stringify(step)),
      id: newId,
      title: `${step.title || step.id} (Copy)`
    };

    // Remove next conditions from the duplicate to avoid circular references
    delete duplicatedStep.next;

    // Add the duplicated step after the original
    const originalIndex = workflow.steps!.findIndex(s => s.id === stepId);
    return addStep(workflow, duplicatedStep, originalIndex + 1);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to duplicate step')
    };
  }
}
```

### Step 2: Create Step Templates

Create `lib/workflow-core/templates.ts`:

```typescript
import type { Step } from './generated';

export const STEP_TEMPLATES: { [key: string]: Partial<Step> } = {
  human_review: {
    role: 'human',
    title: 'Human Review',
    instructions: ['Review the provided content', 'Make a decision'],
    acceptance: ['Decision has been made', 'Feedback has been provided'],
    next: {
      approved: 'next_step',
      rejected: 'revision_step'
    }
  },
  
  ai_analysis: {
    role: 'ai',
    title: 'AI Analysis',
    instructions: ['Analyze the input data', 'Generate insights'],
    acceptance: ['Analysis is complete', 'Insights are documented'],
    token: {
      scope: 'read',
      limit: 1000
    }
  },
  
  system_check: {
    role: 'system',
    title: 'System Check',
    instructions: ['Validate system state', 'Check prerequisites'],
    acceptance: ['All checks passed', 'System is ready'],
    next: {
      success: 'continue',
      failure: 'error_handler'
    }
  },
  
  blank: {
    role: 'human',
    title: 'New Step',
    instructions: ['Add instructions here'],
    acceptance: ['Add acceptance criteria here']
  }
};

export function generateStepId(prefix: string, existingIds: string[]): string {
  let counter = 1;
  let newId = `${prefix}_${counter}`;
  
  while (existingIds.includes(newId)) {
    counter++;
    newId = `${prefix}_${counter}`;
  }
  
  return newId;
}
```

### Step 3: Extend Workflow Store with Step Management

Update `lib/state/workflow.store.ts`:

```typescript
// Add to WorkflowState interface:
interface WorkflowState {
  // ... existing properties
  addStep: (step: Step, position?: number) => void;
  removeStep: (stepId: string) => void;
  duplicateStep: (stepId: string) => void;
}

// Add to store implementation:
export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // ... existing methods

  addStep: (step, position) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = addStep(state.currentWorkflow, step, position);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(result.data, validation);
    } else {
      console.error('Failed to add step:', result.error);
    }
  },
  
  removeStep: (stepId) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    // Deselect if removing selected step
    if (state.selectedStepId === stepId) {
      state.selectStep(null);
    }
    
    const result = removeStep(state.currentWorkflow, stepId);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(result.data, validation);
    } else {
      console.error('Failed to remove step:', result.error);
    }
  },
  
  duplicateStep: (stepId) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const existingIds = state.currentWorkflow.steps?.map(s => s.id) || [];
    const newId = generateStepId(stepId, existingIds);
    
    const result = duplicateStep(state.currentWorkflow, stepId, newId);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      state.updateWorkflow(result.data, validation);
      // Select the new step
      state.selectStep(newId);
    } else {
      console.error('Failed to duplicate step:', result.error);
    }
  }
}));
```

### Step 4: Create Add Step Modal Component

Create `components/add-step-modal/index.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { STEP_TEMPLATES, generateStepId } from '@/lib/workflow-core/templates';
import type { Step } from '@/lib/workflow-core/generated';
import styles from './add-step-modal.module.css';

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: number;
}

export function AddStepModal({ isOpen, onClose, position }: AddStepModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [stepId, setStepId] = useState<string>('');
  const [stepTitle, setStepTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const { currentWorkflow, addStep } = useWorkflowStore();
  
  if (!isOpen) return null;
  
  const handleCreate = () => {
    if (!stepId) {
      setError('Step ID is required');
      return;
    }
    
    // Validate ID format
    const idPattern = /^[a-z][a-z0-9_]*$/;
    if (!idPattern.test(stepId)) {
      setError('Step ID must be lowercase with underscores only');
      return;
    }
    
    // Check for duplicates
    if (currentWorkflow?.steps?.some(s => s.id === stepId)) {
      setError('Step ID already exists');
      return;
    }
    
    const template = STEP_TEMPLATES[selectedTemplate] || STEP_TEMPLATES.blank;
    const newStep: Step = {
      ...template,
      id: stepId,
      title: stepTitle || template.title || 'New Step',
      role: template.role || 'human',
      instructions: template.instructions || ['Add instructions'],
      acceptance: template.acceptance || ['Add acceptance criteria']
    } as Step;
    
    addStep(newStep, position);
    handleClose();
  };
  
  const handleClose = () => {
    setSelectedTemplate('blank');
    setStepId('');
    setStepTitle('');
    setError(null);
    onClose();
  };
  
  const suggestId = () => {
    if (!currentWorkflow) return;
    const existingIds = currentWorkflow.steps?.map(s => s.id) || [];
    const prefix = selectedTemplate === 'blank' ? 'step' : selectedTemplate;
    setStepId(generateStepId(prefix, existingIds));
  };
  
  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Add New Step</h2>
        
        <div className={styles.field}>
          <label>Template:</label>
          <select 
            value={selectedTemplate} 
            onChange={e => setSelectedTemplate(e.target.value)}
          >
            <option value="blank">Blank Step</option>
            <option value="human_review">Human Review</option>
            <option value="ai_analysis">AI Analysis</option>
            <option value="system_check">System Check</option>
          </select>
        </div>
        
        <div className={styles.field}>
          <label>Step ID: *</label>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={stepId}
              onChange={e => setStepId(e.target.value)}
              placeholder="e.g., review_step"
              pattern="[a-z][a-z0-9_]*"
            />
            <button onClick={suggestId} className={styles.suggestButton}>
              Suggest
            </button>
          </div>
          <small>Lowercase letters, numbers, and underscores only</small>
        </div>
        
        <div className={styles.field}>
          <label>Title:</label>
          <input
            type="text"
            value={stepTitle}
            onChange={e => setStepTitle(e.target.value)}
            placeholder="e.g., Review Document"
          />
        </div>
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        
        <div className={styles.actions}>
          <button onClick={handleClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleCreate} className={styles.createButton}>
            Create Step
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 5: Create Modal Styles

Create `components/add-step-modal/add-step-modal.module.css`:

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  margin: 0 0 20px 0;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 14px;
}

.field input,
.field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.field small {
  color: #666;
  font-size: 12px;
}

.inputGroup {
  display: flex;
  gap: 8px;
}

.inputGroup input {
  flex: 1;
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

.error {
  color: #ff0000;
  font-size: 14px;
  margin: 12px 0;
  padding: 8px;
  background: #ffebeb;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancelButton,
.createButton {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.cancelButton {
  background: #f0f0f0;
  color: #333;
}

.cancelButton:hover {
  background: #e0e0e0;
}

.createButton {
  background: #0070f3;
  color: white;
}

.createButton:hover {
  background: #0051cc;
}
```

### Step 6: Create Step Actions Component

Create `components/step-actions/index.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { AddStepModal } from '@/components/add-step-modal';
import styles from './step-actions.module.css';

export function StepActions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const { 
    currentWorkflow, 
    selectedStepId, 
    editMode,
    removeStep,
    duplicateStep
  } = useWorkflowStore();
  
  if (!editMode || !currentWorkflow) {
    return null;
  }
  
  const handleDelete = () => {
    if (confirmDelete && selectedStepId) {
      removeStep(selectedStepId);
      setConfirmDelete(null);
    } else if (selectedStepId) {
      setConfirmDelete(selectedStepId);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };
  
  const handleDuplicate = () => {
    if (selectedStepId) {
      duplicateStep(selectedStepId);
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className={styles.addButton}
          title="Add new step"
        >
          + Add Step
        </button>
        
        {selectedStepId && (
          <>
            <button 
              onClick={handleDuplicate}
              className={styles.duplicateButton}
              title="Duplicate selected step"
            >
              Duplicate
            </button>
            
            <button 
              onClick={handleDelete}
              className={`${styles.deleteButton} ${
                confirmDelete === selectedStepId ? styles.deleteConfirm : ''
              }`}
              title={confirmDelete === selectedStepId ? 
                "Click again to confirm delete" : 
                "Delete selected step"
              }
            >
              {confirmDelete === selectedStepId ? 'Confirm Delete?' : 'Delete'}
            </button>
          </>
        )}
        
        {currentWorkflow.steps && (
          <span className={styles.stepCount}>
            {currentWorkflow.steps.length} step{currentWorkflow.steps.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <AddStepModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
```

### Step 7: Create Step Actions Styles

Create `components/step-actions/step-actions.module.css`:

```css
.container {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
}

.addButton,
.duplicateButton,
.deleteButton {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.addButton {
  background: #10b981;
  color: white;
}

.addButton:hover {
  background: #059669;
}

.duplicateButton {
  background: #6366f1;
  color: white;
}

.duplicateButton:hover {
  background: #4f46e5;
}

.deleteButton {
  background: #ef4444;
  color: white;
}

.deleteButton:hover {
  background: #dc2626;
}

.deleteConfirm {
  background: #991b1b;
  animation: pulse 0.5s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stepCount {
  margin-left: auto;
  color: #666;
  font-size: 14px;
}
```

### Step 8: Update Layout to Include Step Actions

Update `app/page.tsx`:

```typescript
import { StepActions } from '@/components/step-actions';

// In the inspector container section:
<div className={styles.inspectorContainer}>
  <StepActions />
  <StepInspector />
</div>
```

### Step 9: Create Tests for Step Management

Create `lib/workflow-core/api.steps.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { addStep, removeStep, duplicateStep } from './api';
import type { Flow, Step } from './generated';

describe('Step Management', () => {
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
        acceptance: ['It is done'],
        next: { done: 'step2' }
      },
      {
        id: 'step2',
        role: 'ai',
        instructions: ['Process'],
        acceptance: ['Processed']
      }
    ]
  };

  describe('addStep', () => {
    it('should add a new step to workflow', () => {
      const newStep: Step = {
        id: 'step3',
        role: 'system',
        instructions: ['Check'],
        acceptance: ['Checked']
      };
      
      const result = addStep(baseWorkflow, newStep);
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(3);
      expect(result.data?.steps?.[2].id).toBe('step3');
    });

    it('should insert step at specific position', () => {
      const newStep: Step = {
        id: 'step_middle',
        role: 'human',
        instructions: ['Review'],
        acceptance: ['Reviewed']
      };
      
      const result = addStep(baseWorkflow, newStep, 1);
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[1].id).toBe('step_middle');
    });

    it('should reject duplicate step IDs', () => {
      const duplicateStep: Step = {
        id: 'step1',
        role: 'human',
        instructions: ['Duplicate'],
        acceptance: ['Duplicate']
      };
      
      const result = addStep(baseWorkflow, duplicateStep);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already exists');
    });

    it('should validate step ID format', () => {
      const invalidStep: Step = {
        id: 'Step-1', // Invalid: uppercase and hyphen
        role: 'human',
        instructions: ['Test'],
        acceptance: ['Test']
      };
      
      const result = addStep(baseWorkflow, invalidStep);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('lowercase with underscores');
    });
  });

  describe('removeStep', () => {
    it('should remove step by ID', () => {
      const result = removeStep(baseWorkflow, 'step2');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(1);
      expect(result.data?.steps?.[0].id).toBe('step1');
    });

    it('should clean up references to removed step', () => {
      const result = removeStep(baseWorkflow, 'step2');
      
      expect(result.success).toBe(true);
      // step1's next should no longer reference step2
      expect(result.data?.steps?.[0].next).toBeUndefined();
    });

    it('should handle non-existent step ID', () => {
      const result = removeStep(baseWorkflow, 'nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found');
    });
  });

  describe('duplicateStep', () => {
    it('should duplicate a step with new ID', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'step1_copy');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(3);
      expect(result.data?.steps?.find(s => s.id === 'step1_copy')).toBeDefined();
    });

    it('should add (Copy) to title', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'step1_copy');
      
      const copiedStep = result.data?.steps?.find(s => s.id === 'step1_copy');
      expect(copiedStep?.title).toContain('(Copy)');
    });

    it('should remove next conditions from duplicate', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'step1_copy');
      
      const copiedStep = result.data?.steps?.find(s => s.id === 'step1_copy');
      expect(copiedStep?.next).toBeUndefined();
    });
  });
});
```

### Step 10: Create Acceptance Test

Create `scripts/verify-add-remove-steps.py`:

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
    """Check that step management functions are implemented"""
    api_file = 'lib/workflow-core/api.ts'
    with open(api_file, 'r') as f:
        content = f.read()
        functions = ['addStep', 'removeStep', 'duplicateStep']
        for func in functions:
            if f'export function {func}' not in content:
                print(f"❌ Missing function: {func}")
                return False
    print("✅ Step management API functions implemented")
    return True

def check_templates():
    """Check that step templates exist"""
    templates_file = 'lib/workflow-core/templates.ts'
    with open(templates_file, 'r') as f:
        content = f.read()
        if 'STEP_TEMPLATES' not in content:
            print("❌ Missing STEP_TEMPLATES")
            return False
        if 'generateStepId' not in content:
            print("❌ Missing generateStepId function")
            return False
    print("✅ Step templates configured")
    return True

def check_modal_component():
    """Check AddStepModal component"""
    modal_file = 'components/add-step-modal/index.tsx'
    with open(modal_file, 'r') as f:
        content = f.read()
        required = ['selectedTemplate', 'handleCreate', 'suggestId', 'idPattern']
        for item in required:
            if item not in content:
                print(f"❌ Modal missing: {item}")
                return False
    print("✅ AddStepModal component complete")
    return True

def check_step_actions():
    """Check StepActions component"""
    actions_file = 'components/step-actions/index.tsx'
    with open(actions_file, 'r') as f:
        content = f.read()
        required = ['handleDelete', 'handleDuplicate', 'confirmDelete', 'AddStepModal']
        for item in required:
            if item not in content:
                print(f"❌ StepActions missing: {item}")
                return False
    print("✅ StepActions component complete")
    return True

def check_store_methods():
    """Check workflow store has step management methods"""
    store_file = 'lib/state/workflow.store.ts'
    with open(store_file, 'r') as f:
        content = f.read()
        methods = ['addStep:', 'removeStep:', 'duplicateStep:']
        for method in methods:
            if method not in content:
                print(f"❌ Store missing method: {method}")
                return False
    print("✅ Store methods implemented")
    return True

def run_tests():
    """Run step management tests"""
    print("\nRunning step management tests...")
    result = subprocess.run(
        ['pnpm', 'test', 'api.steps.test'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print("❌ Step management tests failed")
        print(result.stdout)
        return False
    
    print("✅ Step management tests passing")
    return True

def main():
    checks = [
        check_file_exists('lib/workflow-core/templates.ts'),
        check_file_exists('components/add-step-modal/index.tsx'),
        check_file_exists('components/add-step-modal/add-step-modal.module.css'),
        check_file_exists('components/step-actions/index.tsx'),
        check_file_exists('components/step-actions/step-actions.module.css'),
        check_api_functions(),
        check_templates(),
        check_modal_component(),
        check_step_actions(),
        check_store_methods(),
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Add/Remove Steps implementation complete!")
        print("Users can now:")
        print("- Add new steps from templates")
        print("- Delete steps with confirmation")
        print("- Duplicate existing steps")
        print("- Auto-generate step IDs")
        print("- See step count in toolbar")
        sys.exit(0)
    else:
        print("\n❌ Add/Remove Steps implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria

- [ ] Add Step button visible in edit mode
- [ ] Modal opens with template selection
- [ ] Step ID validation enforces lowercase with underscores
- [ ] Duplicate ID prevention works
- [ ] Auto-suggest generates unique IDs
- [ ] Templates populate fields correctly
- [ ] New steps appear in the graph immediately
- [ ] Delete button requires confirmation click
- [ ] Duplicate creates copy with new ID and “(Copy)” suffix
- [ ] References to deleted steps are cleaned up
- [ ] Step count updates in toolbar
- [ ] Graph re-renders after add/remove
- [ ] Validation runs after each change
- [ ] Tests pass for all step operations