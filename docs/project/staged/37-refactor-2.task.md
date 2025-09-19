# Refactor 2: Implement Result<T> Pattern

## Objective

Add the Result<T> type pattern to all API functions for proper error handling that aligns with Rust’s error handling paradigm.

## Issue

The API currently throws errors or returns raw values instead of using a Result pattern. This makes error handling inconsistent and incompatible with Rust’s approach.

## Implementation Steps

### Step 1: Create Result Type Definition

Create or update `lib/workflow-core/types.ts`:

```typescript
/**
 * Result type for consistent error handling
 * Mirrors Rust's Result<T, E> pattern
 */
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

/**
 * Helper functions for Result type
 */
export const Result = {
  ok<T>(data: T): Result<T> {
    return { success: true, data };
  },
  
  err<T>(error: string | Error): Result<T> {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(error)
    };
  }
};

/**
 * Validation error type
 */
export interface ValidationError {
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
```

### Step 2: Update All API Functions to Return Result<T>

Update `lib/workflow-core/api.ts`:

**Before:**

```typescript
export function updateStep(
  workflow: Flow,
  stepId: string,
  updates: Partial<Step>
): Flow {
  // ... implementation
  if (error) {
    throw new Error('Step not found');
  }
  return updatedWorkflow;
}
```

**After:**

```typescript
import { Result, ValidationError } from './types';
import type { Flow, Step } from './generated';

export function updateStep(
  workflow: Flow,
  stepId: string,
  updates: Partial<Step>
): Result<Flow> {
  try {
    // ... implementation
    if (!stepExists) {
      return Result.err(`Step with ID "${stepId}" not found`);
    }
    
    // ... update logic
    
    return Result.ok(updatedWorkflow);
  } catch (error) {
    return Result.err(error instanceof Error ? error : new Error('Unknown error'));
  }
}
```

### Step 3: Implement Missing Core Functions

Add these essential functions that are currently missing:

```typescript
/**
 * Load workflow from YAML string
 */
export function loadWorkflow(yamlContent: string): Result<Flow> {
  try {
    if (!yamlContent || yamlContent.trim() === '') {
      return Result.err('Empty YAML content');
    }
    
    const parsed = yaml.load(yamlContent) as any;
    
    // Validate required fields
    if (!parsed.schema || parsed.schema !== 'flowspec.v1') {
      return Result.err('Invalid schema version');
    }
    
    if (!parsed.id || !parsed.title || !parsed.owner) {
      return Result.err('Missing required fields: id, title, or owner');
    }
    
    // Type cast to Flow after validation
    const workflow = parsed as Flow;
    
    // Validate the workflow
    const errors = validateWorkflow(workflow);
    const criticalErrors = errors.filter(e => e.severity === 'error');
    
    if (criticalErrors.length > 0) {
      return Result.err(`Workflow validation failed: ${criticalErrors[0].message}`);
    }
    
    return Result.ok(workflow);
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return Result.err(`YAML parse error: ${error.message}`);
    }
    return Result.err(error instanceof Error ? error : new Error('Failed to load workflow'));
  }
}

/**
 * Save workflow to YAML string
 */
export function saveWorkflow(workflow: Flow): Result<string> {
  try {
    // Validate before saving
    const errors = validateWorkflow(workflow);
    const criticalErrors = errors.filter(e => e.severity === 'error');
    
    if (criticalErrors.length > 0) {
      return Result.err('Cannot save invalid workflow');
    }
    
    // Clean undefined values
    const clean = JSON.parse(JSON.stringify(workflow));
    
    const yamlString = yaml.dump(clean, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    
    return Result.ok(yamlString);
  } catch (error) {
    return Result.err(error instanceof Error ? error : new Error('Failed to save workflow'));
  }
}

/**
 * Validate workflow against schema
 */
export function validateWorkflow(workflow: Flow): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check required fields
  if (!workflow.schema) {
    errors.push({
      field: 'schema',
      message: 'Schema is required',
      severity: 'error'
    });
  }
  
  if (!workflow.id) {
    errors.push({
      field: 'id',
      message: 'Workflow ID is required',
      severity: 'error'
    });
  } else {
    // Validate ID format: domain.name.v1
    const idPattern = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*\.v\d+$/;
    if (!idPattern.test(workflow.id)) {
      errors.push({
        field: 'id',
        message: 'ID must match pattern: domain.name.v1',
        severity: 'error'
      });
    }
  }
  
  if (!workflow.title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      severity: 'error'
    });
  }
  
  if (!workflow.owner) {
    errors.push({
      field: 'owner',
      message: 'Owner email is required',
      severity: 'error'
    });
  } else {
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(workflow.owner)) {
      errors.push({
        field: 'owner',
        message: 'Owner must be a valid email address',
        severity: 'error'
      });
    }
  }
  
  // Validate steps
  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push({
      field: 'steps',
      message: 'At least one step is required',
      severity: 'warning'
    });
  } else {
    workflow.steps.forEach((step, index) => {
      if (!step.id) {
        errors.push({
          field: `steps[${index}].id`,
          message: 'Step ID is required',
          severity: 'error'
        });
      }
      
      if (!step.role) {
        errors.push({
          field: `steps[${index}].role`,
          message: 'Step role is required',
          severity: 'error'
        });
      }
      
      if (!step.instructions || step.instructions.length === 0) {
        errors.push({
          field: `steps[${index}].instructions`,
          message: 'Step instructions are required',
          severity: 'error'
        });
      }
      
      if (!step.acceptance || step.acceptance.length === 0) {
        errors.push({
          field: `steps[${index}].acceptance`,
          message: 'Step acceptance criteria are required',
          severity: 'error'
        });
      }
    });
  }
  
  return errors;
}

/**
 * Create a new workflow
 */
export function createWorkflow(
  id: string,
  title: string,
  owner: string,
  policy?: Flow['policy']
): Result<Flow> {
  try {
    // Validate inputs
    if (!id || !title || !owner) {
      return Result.err('Missing required fields: id, title, or owner');
    }
    
    // Validate ID format
    const idPattern = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*\.v\d+$/;
    if (!idPattern.test(id)) {
      return Result.err('ID must match pattern: domain.name.v1');
    }
    
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(owner)) {
      return Result.err('Owner must be a valid email address');
    }
    
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id,
      title,
      owner,
      policy: policy || { enforcement: 'none' },
      steps: []
    };
    
    return Result.ok(workflow);
  } catch (error) {
    return Result.err(error instanceof Error ? error : new Error('Failed to create workflow'));
  }
}
```

### Step 4: Update All Existing Functions

Convert all existing functions to use Result pattern:

```typescript
export function addStep(
  workflow: Flow,
  step: Step,
  position?: number
): Result<Flow> {
  try {
    // Validation
    if (!step.id || !step.role || !step.instructions || !step.acceptance) {
      return Result.err('Step missing required fields');
    }
    
    // Check for duplicate ID
    if (workflow.steps?.some(s => s.id === step.id)) {
      return Result.err(`Step with ID "${step.id}" already exists`);
    }
    
    // Clone workflow
    const updated = JSON.parse(JSON.stringify(workflow)) as Flow;
    
    // Add step
    if (!updated.steps) {
      updated.steps = [];
    }
    
    if (position !== undefined && position >= 0) {
      updated.steps.splice(position, 0, step);
    } else {
      updated.steps.push(step);
    }
    
    return Result.ok(updated);
  } catch (error) {
    return Result.err(error instanceof Error ? error : new Error('Failed to add step'));
  }
}

// Apply same pattern to: removeStep, duplicateStep, addEdge, removeEdge, updateEdge
```

### Step 5: Update Store to Handle Results

Update `lib/state/workflow.store.ts`:

```typescript
import { loadWorkflow, validateWorkflow, type Result } from '@/lib/workflow-core';

// In setWorkflow function:
loadWorkflowFromYaml: (yamlContent: string) => {
  const result = loadWorkflow(yamlContent);
  
  if (result.success) {
    const errors = validateWorkflow(result.data);
    set({
      currentWorkflow: result.data,
      validationErrors: errors,
      isValid: errors.filter(e => e.severity === 'error').length === 0
    });
    return result;
  } else {
    set({
      currentWorkflow: null,
      validationErrors: [{
        message: result.error.message,
        severity: 'error'
      }],
      isValid: false
    });
    return result;
  }
}
```

### Step 6: Create Verification Script

Create `scripts/verify-result-pattern.py`:

```python
#!/usr/bin/env python3
import re
from pathlib import Path

def check_result_pattern():
    api_file = Path('lib/workflow-core/api.ts')
    
    if not api_file.exists():
        print("❌ API file not found")
        return False
    
    content = api_file.read_text()
    
    # Check for Result type
    if 'type Result<T>' not in content and 'interface Result<T>' not in content:
        print("❌ Result<T> type not defined")
        return False
    
    # Find all exported functions
    functions = re.findall(r'export function (\w+)', content)
    
    issues = []
    for func in functions:
        # Find the function signature
        pattern = f'export function {func}[^{{]+{{'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            signature = match.group(0)
            # Check if it returns Result
            if 'Result<' not in signature and func not in ['validateWorkflow']:
                issues.append(func)
    
    if issues:
        print(f"❌ Functions not returning Result<T>: {', '.join(issues)}")
        return False
    
    print("✅ All functions use Result<T> pattern")
    return True

def check_error_handling():
    api_file = Path('lib/workflow-core/api.ts')
    content = api_file.read_text()
    
    # Check for throw statements
    throws = re.findall(r'throw\s+new\s+Error', content)
    if throws:
        print(f"⚠️ Found {len(throws)} throw statements - should return Result.err() instead")
    
    # Check for Result.ok and Result.err usage
    ok_count = content.count('Result.ok(') + content.count('success: true')
    err_count = content.count('Result.err(') + content.count('success: false')
    
    print(f"✅ Found {ok_count} success returns and {err_count} error returns")
    
    return True

if __name__ == "__main__":
    check_result_pattern()
    check_error_handling()
```

## Success Criteria

- [ ] Result<T> type defined in types.ts
- [ ] All API functions return Result<T> (except validateWorkflow)
- [ ] No throw statements in API functions
- [ ] loadWorkflow function implemented
- [ ] saveWorkflow function implemented
- [ ] createWorkflow function implemented
- [ ] validateWorkflow returns ValidationError[]
- [ ] Store handles Result types properly
- [ ] Tests updated to check for Result pattern
- [ ] Verification script passes

## Testing

```bash
# Verify Result pattern
python3 scripts/verify-result-pattern.py

# Run type checking
pnpm tsc --noEmit

# Run existing tests (may need updates)
pnpm test
```

## Common Pitfalls

1. Don’t forget to handle both success and error cases
1. Always wrap errors in Error objects
1. Don’t throw errors - return Result.err()
1. Remember validateWorkflow returns ValidationError[] not Result

## Estimated Time: 3 hours

This refactoring is essential for Rust compatibility and consistent error handling throughout the application.