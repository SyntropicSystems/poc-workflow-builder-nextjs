# Task 2.2: Live Editing & Validation

## Objective
Enable editing of step properties with live validation and immediate visual feedback in the graph.

## Prerequisites
- Task 2.1 completed (node inspector displaying step details)
- Selection state working in workflow store
- Inspector panel integrated in layout

## Implementation Steps

### Step 1: Implement Core API Edit Functions
Update `lib/workflow-core/api.ts` to implement the edit functions:
```typescript
// Update the previously stubbed functions

export function updateStep(
  workflow: Flow,
  stepId: string,
  updates: Partial<Step>
): Result<Flow> {
  try {
    const stepIndex = workflow.steps?.findIndex(s => s.id === stepId);
    
    if (stepIndex === undefined || stepIndex === -1) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    // Create a deep copy of the workflow
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    // Apply updates to the step
    if (updatedWorkflow.steps && updatedWorkflow.steps[stepIndex]) {
      updatedWorkflow.steps[stepIndex] = {
        ...updatedWorkflow.steps[stepIndex],
        ...updates,
        id: updatedWorkflow.steps[stepIndex].id // Prevent ID changes
      };
    }

    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to update step')
    };
  }
}

export function addStep(
  workflow: Flow,
  step: Step,
  position?: number
): Result<Flow> {
  try {
    // Validate step has required fields
    if (!step.id || !step.role || !step.instructions || !step.acceptance) {
      return {
        success: false,
        error: new Error('Step missing required fields')
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
    const stepIndex = workflow.steps?.findIndex(s => s.id === stepId);
    
    if (stepIndex === undefined || stepIndex === -1) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    // Remove the step
    updatedWorkflow.steps?.splice(stepIndex, 1);

    // Clean up references in other steps' next arrays
    updatedWorkflow.steps?.forEach(step => {
      if (step.next) {
        step.next = step.next.filter(n => n.to !== stepId);
      }
    });

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
```

### Step 2: Extend Workflow Store for Editing
Update `lib/state/workflow.store.ts`:
```typescript
'use client';

import { create } from 'zustand';
import type { Flow, Step, ValidationError } from '@/lib/workflow-core';
import { updateStep as updateStepAPI, validateWorkflow } from '@/lib/workflow-core';

interface WorkflowState {
  currentWorkflow: Flow | null;
  validationErrors: ValidationError[];
  isValid: boolean;
  selectedStepId: string | null;
  selectedStep: Step | null;
  editMode: boolean;
  hasUnsavedChanges: boolean;
  
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
  selectStep: (stepId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
  updateSelectedStep: (updates: Partial<Step>) => Promise<void>;
  markAsSaved: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  validationErrors: [],
  isValid: false,
  selectedStepId: null,
  selectedStep: null,
  editMode: false,
  hasUnsavedChanges: false,
  
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0,
    hasUnsavedChanges: false
  }),
  
  clearWorkflow: () => set({
    currentWorkflow: null,
    validationErrors: [],
    isValid: false,
    selectedStepId: null,
    selectedStep: null,
    editMode: false,
    hasUnsavedChanges: false
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
  
  setEditMode: (enabled) => set({ editMode: enabled }),
  
  updateSelectedStep: async (updates) => {
    const state = get();
    if (!state.selectedStepId || !state.currentWorkflow) return;
    
    const result = updateStepAPI(state.currentWorkflow, state.selectedStepId, updates);
    
    if (result.success) {
      // Validate the updated workflow
      const errors = await validateWorkflow(result.data);
      
      // Update state with new workflow
      set({
        currentWorkflow: result.data,
        validationErrors: errors,
        isValid: errors.filter(e => e.severity === 'error').length === 0,
        hasUnsavedChanges: true
      });
      
      // Update selected step reference
      const updatedStep = result.data.steps?.find(s => s.id === state.selectedStepId);
      if (updatedStep) {
        set({ selectedStep: updatedStep });
      }
    }
  },
  
  markAsSaved: () => set({ hasUnsavedChanges: false })
}));
```

### Step 3: Create Editable Step Inspector
Create `components/step-inspector/editable-inspector.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import type { Step } from '@/lib/workflow-core';
import styles from './step-inspector.module.css';

export function EditableStepInspector() {
  const { 
    selectedStep, 
    selectedStepId, 
    updateSelectedStep,
    validationErrors 
  } = useWorkflowStore();
  
  const [localStep, setLocalStep] = useState<Partial<Step> | null>(null);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedStep) {
      setLocalStep({ ...selectedStep });
      setIsEditing({});
    } else {
      setLocalStep(null);
    }
  }, [selectedStep, selectedStepId]);

  if (!selectedStep || !localStep) {
    return (
      <div className={styles.inspector}>
        <div className={styles.emptyState}>
          <p>Select a step to edit its details</p>
        </div>
      </div>
    );
  }

  const handleFieldEdit = (field: string) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleFieldSave = async (field: keyof Step, value: any) => {
    await updateSelectedStep({ [field]: value });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleFieldCancel = (field: string) => {
    setLocalStep({ ...selectedStep });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...(localStep.instructions || [])];
    newInstructions[index] = value;
    setLocalStep({ ...localStep, instructions: newInstructions });
  };

  const addInstruction = () => {
    const newInstructions = [...(localStep.instructions || []), ''];
    setLocalStep({ ...localStep, instructions: newInstructions });
  };

  const removeInstruction = (index: number) => {
    const newInstructions = (localStep.instructions || []).filter((_, i) => i !== index);
    setLocalStep({ ...localStep, instructions: newInstructions });
  };

  const saveInstructions = async () => {
    await updateSelectedStep({ instructions: localStep.instructions });
    setIsEditing({ ...isEditing, instructions: false });
  };

  // Get validation errors for this step
  const stepErrors = validationErrors.filter(e => 
    e.path.startsWith(`steps[`) && e.path.includes(`.${selectedStepId}`)
  );

  return (
    <div className={styles.inspector}>
      <div className={styles.header}>
        <h3>Edit Step</h3>
        {selectedStepId && <code className={styles.stepId}>{selectedStepId}</code>}
      </div>

      {stepErrors.length > 0 && (
        <div className={styles.errors}>
          {stepErrors.map((error, index) => (
            <div key={index} className={styles.error}>
              {error.message}
            </div>
          ))}
        </div>
      )}

      <div className={styles.content}>
        {/* Title Field */}
        <div className={styles.section}>
          <h4>Basic Information</h4>
          <div className={styles.field}>
            <label>Title</label>
            {isEditing.title ? (
              <div className={styles.editGroup}>
                <input
                  type="text"
                  value={localStep.title || ''}
                  onChange={(e) => setLocalStep({ ...localStep, title: e.target.value })}
                  className={styles.input}
                />
                <button 
                  onClick={() => handleFieldSave('title', localStep.title)}
                  className={styles.saveBtn}
                >
                  Save
                </button>
                <button 
                  onClick={() => handleFieldCancel('title')}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                className={styles.editableValue}
                onClick={() => handleFieldEdit('title')}
              >
                {selectedStep.title || 'Click to add title'}
              </div>
            )}
          </div>

          {/* Role Field */}
          <div className={styles.field}>
            <label>Role</label>
            {isEditing.role ? (
              <div className={styles.editGroup}>
                <select
                  value={localStep.role || ''}
                  onChange={(e) => setLocalStep({ ...localStep, role: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Select role</option>
                  <option value="human">Human</option>
                  <option value="human_ai">Human + AI</option>
                  <option value="ai">AI</option>
                  <option value="automation">Automation</option>
                  <option value="system">System</option>
                </select>
                <button 
                  onClick={() => handleFieldSave('role', localStep.role)}
                  className={styles.saveBtn}
                >
                  Save
                </button>
                <button 
                  onClick={() => handleFieldCancel('role')}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                className={styles.editableValue}
                onClick={() => handleFieldEdit('role')}
              >
                {selectedStep.role || 'Click to set role'}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.section}>
          <h4>
            Instructions
            {!isEditing.instructions && (
              <button 
                onClick={() => handleFieldEdit('instructions')}
                className={styles.editBtn}
              >
                Edit
              </button>
            )}
          </h4>
          
          {isEditing.instructions ? (
            <div className={styles.instructionsEdit}>
              {localStep.instructions?.map((instruction, index) => (
                <div key={index} className={styles.instructionItem}>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className={styles.textarea}
                    rows={2}
                  />
                  <button 
                    onClick={() => removeInstruction(index)}
                    className={styles.removeBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className={styles.instructionActions}>
                <button onClick={addInstruction} className={styles.addBtn}>
                  + Add Instruction
                </button>
                <button onClick={saveInstructions} className={styles.saveBtn}>
                  Save All
                </button>
                <button 
                  onClick={() => handleFieldCancel('instructions')}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <ol className={styles.instructionsList}>
              {selectedStep.instructions?.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              )) || <li className={styles.empty}>No instructions defined</li>}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Add Editor Styles
Update `components/step-inspector/step-inspector.module.css`:
```css
/* Add to existing styles */

.errors {
  background: #fee;
  border: 1px solid #fcc;
  padding: 10px 15px;
  margin: 10px 20px;
  border-radius: 4px;
}

.error {
  color: #c00;
  font-size: 13px;
  margin-bottom: 5px;
}

.error:last-child {
  margin-bottom: 0;
}

.editableValue {
  font-size: 14px;
  color: #333;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  min-height: 36px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.editableValue:hover {
  background: #e8e8e8;
  border-color: #0070f3;
}

.editGroup {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input,
.select,
.textarea {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-family: inherit;
}

.textarea {
  resize: vertical;
  min-height: 50px;
}

.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: #0070f3;
}

.saveBtn,
.cancelBtn,
.editBtn,
.addBtn,
.removeBtn {
  padding: 6px 12px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.saveBtn {
  background: #0070f3;
  color: white;
}

.saveBtn:hover {
  background: #0051cc;
}

.cancelBtn {
  background: #e0e0e0;
  color: #333;
}

.cancelBtn:hover {
  background: #d0d0d0;
}

.editBtn {
  background: transparent;
  color: #0070f3;
  padding: 4px 8px;
  margin-left: 10px;
  font-size: 12px;
}

.editBtn:hover {
  background: #f0f0f0;
}

.addBtn {
  background: #28a745;
  color: white;
}

.addBtn:hover {
  background: #218838;
}

.removeBtn {
  background: #dc3545;
  color: white;
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 20px;
  line-height: 1;
}

.removeBtn:hover {
  background: #c82333;
}

.instructionsEdit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.instructionItem {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.instructionActions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.empty {
  color: #999;
  font-style: italic;
}
```

### Step 5: Create Edit Mode Toggle
Create `components/edit-mode-toggle/index.tsx`:
```typescript
'use client';

import { useWorkflowStore } from '@/lib/state/workflow.store';
import styles from './edit-mode.module.css';

export function EditModeToggle() {
  const { editMode, setEditMode, currentWorkflow, hasUnsavedChanges } = useWorkflowStore();

  if (!currentWorkflow) {
    return null;
  }

  return (
    <div className={styles.toggleContainer}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={editMode}
          onChange={(e) => setEditMode(e.target.checked)}
        />
        <span className={styles.slider}></span>
        <span className={styles.label}>
          {editMode ? 'Edit Mode' : 'View Mode'}
        </span>
      </label>
      {hasUnsavedChanges && (
        <span className={styles.unsaved}>Unsaved changes</span>
      )}
    </div>
  );
}
```

### Step 6: Create Edit Mode Styles
Create `components/edit-mode-toggle/edit-mode.module.css`:
```css
.toggleContainer {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 34px;
  transition: .4s;
  margin-right: 10px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.toggle input:checked + .slider {
  background-color: #0070f3;
}

.toggle input:checked + .slider:before {
  transform: translateX(26px);
}

.label {
  font-size: 14px;
  font-weight: 500;
}

.unsaved {
  color: #ff6b00;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  background: #fff3e0;
  border-radius: 4px;
}
```

### Step 7: Update Components to Use Edit Mode
Update `components/step-inspector/index.tsx`:
```typescript
'use client';

import { useWorkflowStore } from '@/lib/state/workflow.store';
import { EditableStepInspector } from './editable-inspector';
// Keep the existing read-only inspector code...

export function StepInspector() {
  const { editMode } = useWorkflowStore();
  
  // Show editable inspector in edit mode, read-only otherwise
  if (editMode) {
    return <EditableStepInspector />;
  }
  
  // Return the existing read-only inspector
  // ... (keep existing code)
}
```

## Acceptance Tests

Create `scripts/verify-live-editing.py`:
```python
#!/usr/bin/env python3
import os
import sys

def check_api_implementations():
    """Check that edit functions are implemented"""
    api_file = 'lib/workflow-core/api.ts'
    with open(api_file, 'r') as f:
        content = f.read()
        
        # Check that functions are no longer stubs
        if 'throw new Error(\'Not implemented: updateStep\')' in content:
            print("❌ updateStep still not implemented")
            return False
        if 'throw new Error(\'Not implemented: addStep\')' in content:
            print("❌ addStep still not implemented")
            return False
        if 'throw new Error(\'Not implemented: removeStep\')' in content:
            print("❌ removeStep still not implemented")
            return False
    
    print("✅ Edit functions implemented")
    return True

def check_store_edit_methods():
    """Check store has editing methods"""
    store_file = 'lib/state/workflow.store.ts'
    required = [
        'updateSelectedStep',
        'hasUnsavedChanges',
        'markAsSaved'
    ]
    
    with open(store_file, 'r') as f:
        content = f.read()
        missing = [item for item in required if item not in content]
        
        if missing:
            print(f"❌ Store missing: {', '.join(missing)}")
            return False
    
    print("✅ Store has edit methods")
    return True

def check_editable_inspector():
    """Check editable inspector exists"""
    if not os.path.exists('components/step-inspector/editable-inspector.tsx'):
        print("❌ Editable inspector missing")
        return False
    
    print("✅ Editable inspector exists")
    return True

def check_edit_mode_toggle():
    """Check edit mode toggle exists"""
    if not os.path.exists('components/edit-mode-toggle/index.tsx'):
        print("❌ Edit mode toggle missing")
        return False
    
    print("✅ Edit mode toggle exists")
    return True

def main():
    checks = [
        check_api_implementations(),
        check_store_edit_methods(),
        check_editable_inspector(),
        check_edit_mode_toggle()
    ]
    
    if all(checks):
        print("\n🎉 Live editing implementation complete!")
        print("Users can now:")
        print("- Toggle between view and edit modes")
        print("- Edit step properties with immediate feedback")
        print("- See validation errors in real-time")
        print("- Track unsaved changes")
        sys.exit(0)
    else:
        print("\n❌ Live editing implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria
- [ ] Edit mode toggle switches between view and edit modes
- [ ] Clicking on fields in edit mode allows editing
- [ ] Changes update the workflow in real-time
- [ ] Validation runs on every change
- [ ] Validation errors display in the inspector
- [ ] Graph updates immediately when step properties change
- [ ] Unsaved changes indicator appears when edits are made
- [ ] Instructions can be added, edited, and removed
- [ ] Role can be selected from dropdown
- [ ] Cancel reverts changes, Save applies them