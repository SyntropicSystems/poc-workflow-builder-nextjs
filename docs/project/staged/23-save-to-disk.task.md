# Task 2.3: Save to Disk

## Objective

Implement the ability to save edited workflows back to the original file on the local filesystem, completing the core edit-save cycle.

## Prerequisites

- Task 2.1 and 2.2 completed (editing capabilities working)
- File handle stored in filesystem store when file was loaded
- Workflow state with modifications in workflow store
- Validation running on every change

## Implementation Steps

### Step 1: Implement Core API Save Function

Update `lib/workflow-core/api.ts` to implement the `saveWorkflow` function:

```typescript
import * as yaml from 'js-yaml';

export function saveWorkflow(workflow: Flow): Result<string> {
  try {
    // Validate before saving
    const validation = validateWorkflow(workflow);
    const hasErrors = validation.filter(e => e.severity === 'error').length > 0;
    
    if (hasErrors) {
      return {
        success: false,
        error: new Error('Cannot save invalid workflow. Fix validation errors first.')
      };
    }

    // Clean up the workflow object before serialization
    // Remove any undefined or null values that shouldn't be in YAML
    const cleanWorkflow = JSON.parse(JSON.stringify(workflow));
    
    // Convert to YAML with proper formatting
    const yamlString = yaml.dump(cleanWorkflow, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true,  // Don't use YAML references
      sortKeys: false // Preserve key order
    });
    
    return {
      success: true,
      data: yamlString
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to serialize workflow')
    };
  }
}
```

### Step 2: Add File Writing to File System Utilities

Update `lib/fs/file-operations.ts` (new file):

```typescript
'use client';

export async function writeWorkflowFile(
  fileHandle: FileSystemFileHandle,
  content: string
): Promise<void> {
  try {
    // Request write permission if needed
    const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };
    const permission = await fileHandle.queryPermission(options);
    
    if (permission !== 'granted') {
      const requestResult = await fileHandle.requestPermission(options);
      if (requestResult !== 'granted') {
        throw new Error('Write permission denied');
      }
    }
    
    // Create a writable stream
    const writable = await fileHandle.createWritable();
    
    try {
      // Write the content
      await writable.write(content);
      // Close the stream to save
      await writable.close();
    } catch (error) {
      // If there's an error, abort the write
      await writable.abort();
      throw error;
    }
  } catch (error) {
    throw new Error(
      `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function hasUnsavedChanges(
  fileHandle: FileSystemFileHandle,
  currentContent: string
): Promise<boolean> {
  try {
    const file = await fileHandle.getFile();
    const originalContent = await file.text();
    return originalContent !== currentContent;
  } catch {
    // If we can't read the file, assume there are changes
    return true;
  }
}
```

### Step 3: Extend Filesystem Store for File Handle Tracking

Update `lib/state/filesystem.store.ts`:

```typescript
'use client';

import { create } from 'zustand';

interface FileInfo {
  handle: FileSystemFileHandle;
  path: string;
  name: string;
}

interface FileSystemState {
  directoryHandle: FileSystemDirectoryHandle | null;
  directoryName: string | null;
  selectedFile: FileInfo | null;
  hasUnsavedChanges: boolean;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  clearDirectory: () => void;
  setSelectedFile: (file: FileInfo | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const useFileSystemStore = create<FileSystemState>((set) => ({
  directoryHandle: null,
  directoryName: null,
  selectedFile: null,
  hasUnsavedChanges: false,
  
  setDirectoryHandle: (handle) => set({ 
    directoryHandle: handle,
    directoryName: handle?.name || null 
  }),
  
  clearDirectory: () => set({ 
    directoryHandle: null,
    directoryName: null,
    selectedFile: null,
    hasUnsavedChanges: false
  }),
  
  setSelectedFile: (file) => set({ 
    selectedFile: file,
    hasUnsavedChanges: false 
  }),
  
  setHasUnsavedChanges: (hasChanges) => set({ 
    hasUnsavedChanges: hasChanges 
  })
}));
```

### Step 4: Extend Workflow Store for Change Tracking

Update `lib/state/workflow.store.ts`:

```typescript
'use client';

import { create } from 'zustand';
import type { Flow, Step, ValidationError } from '@/lib/workflow-core';

interface WorkflowState {
  currentWorkflow: Flow | null;
  originalWorkflow: Flow | null; // Track original for comparison
  validationErrors: ValidationError[];
  isValid: boolean;
  selectedStepId: string | null;
  selectedStep: Step | null;
  editMode: boolean;
  isDirty: boolean; // Track if changes were made
  
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  updateWorkflow: (workflow: Flow, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
  selectStep: (stepId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
  updateStep: (stepId: string, updates: Partial<Step>) => void;
  markAsSaved: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  originalWorkflow: null,
  validationErrors: [],
  isValid: false,
  selectedStepId: null,
  selectedStep: null,
  editMode: false,
  isDirty: false,
  
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    originalWorkflow: workflow ? JSON.parse(JSON.stringify(workflow)) : null,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0,
    isDirty: false
  }),
  
  updateWorkflow: (workflow, errors = []) => {
    const state = get();
    const isDirty = JSON.stringify(workflow) !== JSON.stringify(state.originalWorkflow);
    
    set({
      currentWorkflow: workflow,
      validationErrors: errors,
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      isDirty
    });
  },
  
  markAsSaved: () => {
    const state = get();
    set({
      originalWorkflow: state.currentWorkflow ? 
        JSON.parse(JSON.stringify(state.currentWorkflow)) : null,
      isDirty: false
    });
  },
  
  // ... rest of the methods remain the same
  clearWorkflow: () => set({
    currentWorkflow: null,
    originalWorkflow: null,
    validationErrors: [],
    isValid: false,
    selectedStepId: null,
    selectedStep: null,
    editMode: false,
    isDirty: false
  }),
  
  selectStep: (stepId) => {
    const state = get();
    const step = stepId && state.currentWorkflow?.steps 
      ? state.currentWorkflow.steps.find(s => s.id === stepId) || null
      : null;
    
    set({
      selectedStepId: stepId,
      selectedStep: step
    });
  },
  
  setEditMode: (enabled) => set({ editMode: enabled }),
  
  updateStep: (stepId, updates) => {
    const state = get();
    if (!state.currentWorkflow || !state.currentWorkflow.steps) return;
    
    const stepIndex = state.currentWorkflow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    const updatedSteps = [...state.currentWorkflow.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], ...updates };
    
    const updatedWorkflow = { ...state.currentWorkflow, steps: updatedSteps };
    state.updateWorkflow(updatedWorkflow);
  }
}));
```

### Step 5: Create Save Button Component

Create `components/save-button/index.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { saveWorkflow } from '@/lib/workflow-core/api';
import { writeWorkflowFile } from '@/lib/fs/file-operations';
import styles from './save-button.module.css';

export function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { currentWorkflow, isValid, isDirty, markAsSaved } = useWorkflowStore();
  const { selectedFile } = useFileSystemStore();
  
  const handleSave = async () => {
    if (!currentWorkflow || !selectedFile || !isValid) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Convert workflow to YAML
      const result = saveWorkflow(currentWorkflow);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to serialize workflow');
      }
      
      // Write to file
      await writeWorkflowFile(selectedFile.handle, result.data);
      
      // Mark as saved in store
      markAsSaved();
      setLastSaved(new Date());
      
      // Show success feedback (could be a toast)
      console.log('Workflow saved successfully');
      
    } catch (error) {
      console.error('Save failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && isValid && !isSaving) {
          handleSave();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isValid, isSaving]);
  
  if (!selectedFile) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      <button
        className={styles.saveButton}
        onClick={handleSave}
        disabled={!isDirty || !isValid || isSaving}
        title={!isValid ? 'Fix validation errors before saving' : 'Save workflow (Ctrl+S)'}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      
      {isDirty && (
        <span className={styles.unsavedIndicator}>●</span>
      )}
      
      {lastSaved && (
        <span className={styles.lastSaved}>
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
      
      {saveError && (
        <div className={styles.error}>{saveError}</div>
      )}
    </div>
  );
}
```

### Step 6: Create Save Button Styles

Create `components/save-button/save-button.module.css`:

```css
.container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

.saveButton {
  padding: 8px 16px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.saveButton:hover:not(:disabled) {
  background: #0051cc;
}

.saveButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unsavedIndicator {
  color: #ff6b6b;
  font-size: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.lastSaved {
  font-size: 12px;
  color: #666;
}

.error {
  color: #ff0000;
  font-size: 12px;
  padding: 4px 8px;
  background: #ffebeb;
  border-radius: 4px;
}
```

### Step 7: Update Workflow Loader to Track File Handle

Update `components/workflow-loader/index.tsx` to store file handle:

```typescript
// In the handleFileSelect function, after successful load:
const handleFileSelect = async (file: WorkflowFile) => {
  try {
    setIsLoading(true);
    setLoadError(null);
    
    const fileHandle = await directoryHandle.getFileHandle(file.name);
    const fileData = await fileHandle.getFile();
    const content = await fileData.text();
    
    const result = loadWorkflow(content);
    
    if (result.success && result.data) {
      const validation = validateWorkflow(result.data);
      setWorkflow(result.data, validation);
      
      // Store the file handle for saving
      setSelectedFile({
        handle: fileHandle,
        path: file.path,
        name: file.name
      });
      
      setSelectedFileName(file.name);
    } else {
      setLoadError(result.error?.message || 'Failed to load workflow');
    }
  } catch (error) {
    // ... error handling
  }
};
```

### Step 8: Integrate Save Button into Layout

Update `app/page.tsx` to include the save button:

```typescript
import { DirectoryPicker } from '@/components/directory-picker';
import { WorkflowLoader } from '@/components/workflow-loader';
import { WorkflowGraph } from '@/components/workflow-graph';
import { StepInspector } from '@/components/step-inspector';
import { SaveButton } from '@/components/save-button';
import { ValidationStatus } from '@/components/validation-status';

export default function WorkflowBuilderPage() {
  return (
    <main className={styles.main}>
      <div className={styles.toolbar}>
        <DirectoryPicker />
        <WorkflowLoader />
        <SaveButton />
        <ValidationStatus />
      </div>
      
      <div className={styles.content}>
        <div className={styles.graphContainer}>
          <WorkflowGraph />
        </div>
        <div className={styles.inspectorContainer}>
          <StepInspector />
        </div>
      </div>
    </main>
  );
}
```

### Step 9: Add Tests for Save Functionality

Create `lib/workflow-core/api.save.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { saveWorkflow } from './api';
import { Flow } from './generated';
import * as yaml from 'js-yaml';

describe('saveWorkflow', () => {
  const validWorkflow: Flow = {
    schema: 'flowspec.v1',
    id: 'test.workflow.v1',
    title: 'Test Workflow',
    owner: 'test@example.com',
    steps: [
      {
        id: 'step1',
        title: 'First Step',
        role: 'human',
        instructions: ['Do something'],
        acceptance: ['Something is done']
      }
    ]
  };

  it('should serialize a valid workflow to YAML', () => {
    const result = saveWorkflow(validWorkflow);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    // Parse the YAML back to verify it's valid
    const parsed = yaml.load(result.data!) as Flow;
    expect(parsed.id).toBe(validWorkflow.id);
    expect(parsed.steps).toHaveLength(1);
  });

  it('should reject invalid workflows', () => {
    const invalidWorkflow = {
      ...validWorkflow,
      id: 'invalid-id-format' // Wrong format
    };
    
    const result = saveWorkflow(invalidWorkflow as Flow);
    
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('validation errors');
  });

  it('should preserve all workflow properties', () => {
    const workflowWithPolicy: Flow = {
      ...validWorkflow,
      policy: {
        enforcement: 'guard',
        rules: ['rule1']
      }
    };
    
    const result = saveWorkflow(workflowWithPolicy);
    expect(result.success).toBe(true);
    
    const parsed = yaml.load(result.data!) as Flow;
    expect(parsed.policy?.enforcement).toBe('guard');
    expect(parsed.policy?.rules).toEqual(['rule1']);
  });
});
```

### Step 10: Create Acceptance Test

Create `scripts/verify-save-to-disk.py`:

```python
#!/usr/bin/env python3
import os
import sys
import subprocess
import tempfile
import yaml
from pathlib import Path

def check_file_exists(filepath):
    """Check if a file exists"""
    if not os.path.exists(filepath):
        print(f"❌ Missing file: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_save_api_implementation():
    """Check that saveWorkflow is implemented"""
    api_file = 'lib/workflow-core/api.ts'
    with open(api_file, 'r') as f:
        content = f.read()
        if 'export function saveWorkflow' not in content:
            print("❌ saveWorkflow function not exported")
            return False
        if 'yaml.dump' not in content:
            print("❌ saveWorkflow doesn't use yaml.dump")
            return False
    print("✅ saveWorkflow API implemented")
    return True

def check_file_write_utility():
    """Check file writing utilities exist"""
    fs_file = 'lib/fs/file-operations.ts'
    with open(fs_file, 'r') as f:
        content = f.read()
        required_functions = [
            'writeWorkflowFile',
            'createWritable',
            'requestPermission',
            'hasUnsavedChanges'
        ]
        for func in required_functions:
            if func not in content:
                print(f"❌ Missing function: {func}")
                return False
    print("✅ File write utilities implemented")
    return True

def check_save_button_component():
    """Check SaveButton component exists and is functional"""
    component_file = 'components/save-button/index.tsx'
    with open(component_file, 'r') as f:
        content = f.read()
        required_elements = [
            'saveWorkflow',
            'writeWorkflowFile',
            'handleSave',
            'isDirty',
            'markAsSaved',
            'Ctrl+S'
        ]
        for element in required_elements:
            if element not in content:
                print(f"❌ SaveButton missing: {element}")
                return False
    print("✅ SaveButton component complete")
    return True

def check_change_tracking():
    """Check that stores track changes"""
    workflow_store = 'lib/state/workflow.store.ts'
    with open(workflow_store, 'r') as f:
        content = f.read()
        if 'isDirty' not in content:
            print("❌ Workflow store doesn't track isDirty")
            return False
        if 'originalWorkflow' not in content:
            print("❌ Workflow store doesn't track original")
            return False
        if 'markAsSaved' not in content:
            print("❌ Workflow store missing markAsSaved")
            return False
    
    print("✅ Change tracking implemented")
    return True

def run_save_tests():
    """Run the save functionality tests"""
    print("\nRunning save tests...")
    result = subprocess.run(
        ['pnpm', 'test', 'api.save.test'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print("❌ Save tests failed")
        print(result.stdout)
        return False
    
    print("✅ Save tests passing")
    return True

def test_yaml_round_trip():
    """Test that YAML serialization round-trips correctly"""
    test_workflow = {
        'schema': 'flowspec.v1',
        'id': 'test.workflow.v1',
        'title': 'Test Workflow',
        'owner': 'test@example.com',
        'steps': [
            {
                'id': 'step1',
                'role': 'human',
                'instructions': ['Do something'],
                'acceptance': ['It is done']
            }
        ]
    }
    
    # Create temporary test file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.flow.yaml', delete=False) as f:
        yaml.dump(test_workflow, f)
        temp_path = f.name
    
    try:
        # Read it back
        with open(temp_path, 'r') as f:
            loaded = yaml.safe_load(f)
        
        if loaded != test_workflow:
            print("❌ YAML round-trip failed")
            return False
        
        print("✅ YAML round-trip successful")
        return True
        
    finally:
        os.unlink(temp_path)

def main():
    checks = [
        check_file_exists('lib/workflow-core/api.ts'),
        check_file_exists('lib/fs/file-operations.ts'),
        check_file_exists('components/save-button/index.tsx'),
        check_file_exists('components/save-button/save-button.module.css'),
        check_save_api_implementation(),
        check_file_write_utility(),
        check_save_button_component(),
        check_change_tracking(),
        run_save_tests(),
        test_yaml_round_trip()
    ]
    
    if all(checks):
        print("\n🎉 Save to disk implementation complete!")
        print("Users can now:")
        print("- Save edited workflows back to disk")
        print("- See unsaved changes indicator")
        print("- Use Ctrl+S keyboard shortcut")
        print("- Get validation before saving")
        print("- See last saved timestamp")
        sys.exit(0)
    else:
        print("\n❌ Save to disk implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria

- [ ] Save button appears when a file is loaded
- [ ] Save button is disabled when there are no changes
- [ ] Save button is disabled when workflow is invalid
- [ ] Unsaved changes indicator (●) appears when edits are made
- [ ] Ctrl+S keyboard shortcut triggers save
- [ ] Saving writes the YAML back to the original file
- [ ] After saving, the unsaved indicator disappears
- [ ] Last saved timestamp is displayed
- [ ] Error messages shown if save fails
- [ ] File permissions are requested if needed
- [ ] Workflow validation prevents saving invalid files
- [ ] Tests pass for YAML serialization
- [ ] Round-trip works: load → edit → save → reload shows changes

## Notes for Cline Implementation

1. The File System API requires user permission for write access
1. The `createWritable()` API is the modern way to write files
1. Always validate before saving to prevent corrupted files
1. Track both current and original workflow to detect changes
1. The save button should provide clear visual feedback
1. Handle edge cases like permission denial gracefully
1. Use the stored file handle from when the file was loaded

This completes the core edit-save cycle, allowing users to make changes and persist them back to their local filesystem.​​​​​​​​​​​​​​​​