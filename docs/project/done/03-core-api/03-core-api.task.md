# Task 0.3: Core API Scaffolding

## Objective

Define the formal API contract between the UI and core logic layer using the generated Protobuf types.

## Prerequisites

- Task 0.2 completed (schema types generated)

## Implementation Steps

### Step 1: Create Core API Types

Create `lib/workflow-core/types.ts`:

```typescript
import type { Flow, Step, Check } from './generated'

// Result type for operations that can fail
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

// Validation error with location information
export interface ValidationError {
  path: string      // e.g., "steps[0].id"
  message: string   // Human-readable error
  severity: 'error' | 'warning'
}

// Options for workflow operations
export interface WorkflowOptions {
  strict?: boolean  // If true, warnings become errors
}
```

### Step 2: Create Core API Module

Create `lib/workflow-core/api.ts`:

```typescript
import type { Flow, Step } from './generated'
import type { Result, ValidationError, WorkflowOptions } from './types'

/**
 * Parse and validate a YAML string into a Flow object
 * @param yamlString - Raw YAML content from file
 * @param options - Parsing options
 * @returns Validated Flow object or error
 */
export async function loadWorkflow(
  yamlString: string,
  options: WorkflowOptions = {}
): Promise<Result<Flow>> {
  throw new Error('Not implemented: loadWorkflow')
}

/**
 * Serialize a Flow object back to YAML string
 * @param workflow - Flow object to serialize
 * @returns YAML string representation
 */
export async function saveWorkflow(
  workflow: Flow
): Promise<Result<string>> {
  throw new Error('Not implemented: saveWorkflow')
}

/**
 * Validate a Flow object against schema rules
 * @param workflow - Flow object to validate
 * @param options - Validation options
 * @returns Array of validation errors (empty if valid)
 */
export async function validateWorkflow(
  workflow: Flow,
  options: WorkflowOptions = {}
): Promise<ValidationError[]> {
  throw new Error('Not implemented: validateWorkflow')
}

/**
 * Update a specific step in the workflow
 * @param workflow - Current workflow
 * @param stepId - ID of step to update
 * @param updates - Partial step data to merge
 * @returns New workflow with updated step
 */
export function updateStep(
  workflow: Flow,
  stepId: string,
  updates: Partial<Step>
): Result<Flow> {
  throw new Error('Not implemented: updateStep')
}

/**
 * Add a new step to the workflow
 * @param workflow - Current workflow
 * @param step - New step to add
 * @param position - Optional insertion index
 * @returns New workflow with added step
 */
export function addStep(
  workflow: Flow,
  step: Step,
  position?: number
): Result<Flow> {
  throw new Error('Not implemented: addStep')
}

/**
 * Remove a step from the workflow
 * @param workflow - Current workflow
 * @param stepId - ID of step to remove
 * @returns New workflow without the step
 */
export function removeStep(
  workflow: Flow,
  stepId: string
): Result<Flow> {
  throw new Error('Not implemented: removeStep')
}

/**
 * Create a new workflow from a minimal template
 * @param id - Workflow ID (e.g., "domain.name.v1")
 * @param title - Human-readable title
 * @returns New workflow with minimal valid structure
 */
export function createWorkflowFromTemplate(
  id: string,
  title: string
): Flow {
  throw new Error('Not implemented: createWorkflowFromTemplate')
}
```

### Step 3: Create Index Export

Create `lib/workflow-core/index.ts`:

```typescript
// Re-export all API functions
export {
  loadWorkflow,
  saveWorkflow,
  validateWorkflow,
  updateStep,
  addStep,
  removeStep,
  createWorkflowFromTemplate
} from './api'

// Re-export types
export type {
  Result,
  ValidationError,
  WorkflowOptions
} from './types'

// Re-export generated Protobuf types
export type {
  Flow,
  Step,
  Policy,
  Context,
  Parameter,
  Role,
  Artifacts,
  Events,
  Token,
  Acceptance,
  Check
} from './generated'
```

### Step 4: Create API Shape Tests

Create `lib/workflow-core/api.shape.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import * as api from './api'
import type { Flow, Step } from './generated'

describe('Core API Shape', () => {
  it('should export loadWorkflow function', () => {
    expect(typeof api.loadWorkflow).toBe('function')
    expect(api.loadWorkflow.length).toBe(2) // yamlString + options
  })
  
  it('should export saveWorkflow function', () => {
    expect(typeof api.saveWorkflow).toBe('function')
    expect(api.saveWorkflow.length).toBe(1) // workflow
  })
  
  it('should export validateWorkflow function', () => {
    expect(typeof api.validateWorkflow).toBe('function')
    expect(api.validateWorkflow.length).toBe(2) // workflow + options
  })
  
  it('should export updateStep function', () => {
    expect(typeof api.updateStep).toBe('function')
    expect(api.updateStep.length).toBe(3) // workflow + stepId + updates
  })
  
  it('should export addStep function', () => {
    expect(typeof api.addStep).toBe('function')
    expect(api.addStep.length).toBe(3) // workflow + step + position
  })
  
  it('should export removeStep function', () => {
    expect(typeof api.removeStep).toBe('function')
    expect(api.removeStep.length).toBe(2) // workflow + stepId
  })
  
  it('should export createWorkflowFromTemplate function', () => {
    expect(typeof api.createWorkflowFromTemplate).toBe('function')
    expect(api.createWorkflowFromTemplate.length).toBe(2) // id + title
  })
  
  it('should throw not implemented errors', async () => {
    await expect(api.loadWorkflow('test')).rejects.toThrow('Not implemented')
    await expect(api.saveWorkflow({} as Flow)).rejects.toThrow('Not implemented')
    await expect(api.validateWorkflow({} as Flow)).rejects.toThrow('Not implemented')
    
    expect(() => api.updateStep({} as Flow, 'id', {})).toThrow('Not implemented')
    expect(() => api.addStep({} as Flow, {} as Step)).toThrow('Not implemented')
    expect(() => api.removeStep({} as Flow, 'id')).toThrow('Not implemented')
    expect(() => api.createWorkflowFromTemplate('id', 'title')).toThrow('Not implemented')
  })
})
```

### Step 5: Create Module Structure Test

Create `lib/workflow-core/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import * as workflowCore from './index'

describe('Workflow Core Module', () => {
  it('should export all API functions', () => {
    const expectedExports = [
      'loadWorkflow',
      'saveWorkflow',
      'validateWorkflow',
      'updateStep',
      'addStep',
      'removeStep',
      'createWorkflowFromTemplate'
    ]
    
    for (const exportName of expectedExports) {
      expect(workflowCore).toHaveProperty(exportName)
      expect(typeof workflowCore[exportName]).toBe('function')
    }
  })
})
```

## Acceptance Tests

Create `scripts/verify-api.py`:

```python
#!/usr/bin/env python3
import subprocess
import os
import sys

def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    
    # Check file has content
    with open(filepath, 'r') as f:
        content = f.read().strip()
        if len(content) < 50:
            print(f"❌ File too small: {filepath}")
            return False
    
    print(f"✅ Found: {filepath}")
    return True

def check_api_exports():
    """Verify API module has expected exports"""
    api_file = 'lib/workflow-core/api.ts'
    required_functions = [
        'loadWorkflow',
        'saveWorkflow',
        'validateWorkflow',
        'updateStep',
        'addStep',
        'removeStep',
        'createWorkflowFromTemplate'
    ]
    
    with open(api_file, 'r') as f:
        content = f.read()
        missing = []
        for func in required_functions:
            if f'export async function {func}' not in content and f'export function {func}' not in content:
                missing.append(func)
        
        if missing:
            print(f"❌ Missing exports: {', '.join(missing)}")
            return False
    
    print("✅ All API functions exported")
    return True

def run_tests():
    """Run the API shape tests"""
    result = subprocess.run(
        ['pnpm', 'test', 'lib/workflow-core/api.shape.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ API shape tests pass")
        return True
    
    print(f"❌ Tests failed:\n{result.stdout}")
    return False

def main():
    checks = [
        check_file_exists('lib/workflow-core/types.ts'),
        check_file_exists('lib/workflow-core/api.ts'),
        check_file_exists('lib/workflow-core/index.ts'),
        check_file_exists('lib/workflow-core/api.shape.test.ts'),
        check_api_exports(),
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Core API scaffolding complete!")
        print("API boundary established and ready for implementation.")
        sys.exit(0)
    else:
        print("\n❌ API scaffolding incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria

- [ ] Core API module created with all function signatures
- [ ] Types properly imported from generated Protobuf
- [ ] Result type pattern established for error handling
- [ ] All functions throw “not implemented” errors
- [ ] API shape tests pass
- [ ] Clean module exports via index.ts
- [ ] All verification checks pass

## Notes for Next Phase

This completes the foundation. The API boundary is now established. In Phase 1, we will:

1. Implement the File System Access layer
1. Implement loadWorkflow with YAML parsing
1. Add basic validation logic
1. Create the React Flow visualization

The key achievement here is that the UI can now be built against this API contract, and the implementation can be filled in incrementally without breaking the interface.