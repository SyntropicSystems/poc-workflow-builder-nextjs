# Refactor 4: Add Comprehensive Tests

## Objective

Add tests for all API functions to achieve at least 80% coverage, ensuring the implementation is correct before proceeding to Phase 4.

## Issue

Current test coverage is 0% for API functions despite having test files. All 8 core API functions are untested.

## Untested Functions

- `loadWorkflow`
- `saveWorkflow`
- `validateWorkflow`
- `createWorkflow`
- `createWorkflowFromTemplate`
- `addStep`
- `removeStep`
- `updateStep`
- `duplicateStep`
- `addEdge`
- `removeEdge`
- `updateEdge`

## Implementation Steps

### Step 1: Create Core API Tests

Create `lib/workflow-core/api.core.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  loadWorkflow,
  saveWorkflow,
  validateWorkflow,
  createWorkflow
} from './api';
import type { Flow } from './generated';

describe('Core API Functions', () => {
  describe('loadWorkflow', () => {
    it('should load valid YAML successfully', () => {
      const yaml = `
schema: flowspec.v1
id: test.workflow.v1
title: Test Workflow
owner: test@example.com
steps:
  - id: step1
    role: human
    instructions:
      - Do something
    acceptance:
      - It is done
`;
      const result = loadWorkflow(yaml);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test.workflow.v1');
        expect(result.data.steps).toHaveLength(1);
      }
    });
    
    it('should handle empty YAML', () => {
      const result = loadWorkflow('');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Empty');
      }
    });
    
    it('should handle invalid YAML syntax', () => {
      const yaml = `
schema: flowspec.v1
id: [this is: invalid yaml
`;
      const result = loadWorkflow(yaml);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('parse');
      }
    });
    
    it('should validate required fields', () => {
      const yaml = `
schema: flowspec.v1
title: Missing ID
`;
      const result = loadWorkflow(yaml);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('required');
      }
    });
    
    it('should handle wrong schema version', () => {
      const yaml = `
schema: flowspec.v2
id: test.v1
title: Test
owner: test@example.com
`;
      const result = loadWorkflow(yaml);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('schema');
      }
    });
  });
  
  describe('saveWorkflow', () => {
    const validWorkflow: Flow = {
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
        }
      ]
    };
    
    it('should save valid workflow to YAML', () => {
      const result = saveWorkflow(validWorkflow);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('schema: flowspec.v1');
        expect(result.data).toContain('id: test.workflow.v1');
        expect(result.data).toContain('step1');
      }
    });
    
    it('should reject invalid workflow', () => {
      const invalidWorkflow = {
        ...validWorkflow,
        id: 'invalid id with spaces'
      };
      
      const result = saveWorkflow(invalidWorkflow);
      
      expect(result.success).toBe(false);
    });
    
    it('should preserve complex structures', () => {
      const complexWorkflow: Flow = {
        ...validWorkflow,
        policy: {
          enforcement: 'guard',
          rules: ['rule1', 'rule2']
        },
        steps: [
          {
            id: 'step1',
            role: 'human',
            title: 'Step One',
            instructions: ['Do A', 'Do B'],
            acceptance: ['A done', 'B done'],
            next: {
              success: 'step2',
              failure: 'step3'
            },
            token: {
              scope: 'read',
              limit: 100
            }
          }
        ]
      };
      
      const result = saveWorkflow(complexWorkflow);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Parse it back to verify round-trip
        const parsed = loadWorkflow(result.data);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.policy?.enforcement).toBe('guard');
          expect(parsed.data.steps?.[0].next?.success).toBe('step2');
        }
      }
    });
  });
  
  describe('validateWorkflow', () => {
    it('should return empty array for valid workflow', () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'test.workflow.v1',
        title: 'Test',
        owner: 'test@example.com',
        steps: []
      };
      
      const errors = validateWorkflow(workflow);
      const criticalErrors = errors.filter(e => e.severity === 'error');
      
      expect(criticalErrors).toHaveLength(0);
    });
    
    it('should detect missing required fields', () => {
      const workflow: any = {
        schema: 'flowspec.v1'
        // Missing id, title, owner
      };
      
      const errors = validateWorkflow(workflow);
      
      expect(errors.some(e => e.field === 'id')).toBe(true);
      expect(errors.some(e => e.field === 'title')).toBe(true);
      expect(errors.some(e => e.field === 'owner')).toBe(true);
    });
    
    it('should validate ID format', () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'InvalidID',  // Should be lowercase.with.dots.v1
        title: 'Test',
        owner: 'test@example.com',
        steps: []
      };
      
      const errors = validateWorkflow(workflow);
      
      expect(errors.some(e => 
        e.field === 'id' && e.message.includes('pattern')
      )).toBe(true);
    });
    
    it('should validate email format', () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'test.v1',
        title: 'Test',
        owner: 'not-an-email',
        steps: []
      };
      
      const errors = validateWorkflow(workflow);
      
      expect(errors.some(e => 
        e.field === 'owner' && e.message.includes('email')
      )).toBe(true);
    });
    
    it('should validate step required fields', () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'test.v1',
        title: 'Test',
        owner: 'test@example.com',
        steps: [
          {
            id: 'step1',
            role: 'human',
            instructions: [],  // Empty
            acceptance: []     // Empty
          }
        ]
      };
      
      const errors = validateWorkflow(workflow);
      
      expect(errors.some(e => e.field?.includes('instructions'))).toBe(true);
      expect(errors.some(e => e.field?.includes('acceptance'))).toBe(true);
    });
  });
  
  describe('createWorkflow', () => {
    it('should create valid workflow', () => {
      const result = createWorkflow(
        'test.workflow.v1',
        'Test Workflow',
        'test@example.com'
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schema).toBe('flowspec.v1');
        expect(result.data.steps).toEqual([]);
        expect(result.data.policy?.enforcement).toBe('none');
      }
    });
    
    it('should accept custom policy', () => {
      const result = createWorkflow(
        'test.v1',
        'Test',
        'test@example.com',
        { enforcement: 'guard' }
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.policy?.enforcement).toBe('guard');
      }
    });
    
    it('should validate ID format', () => {
      const result = createWorkflow(
        'INVALID',
        'Test',
        'test@example.com'
      );
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('pattern');
      }
    });
    
    it('should validate email', () => {
      const result = createWorkflow(
        'test.v1',
        'Test',
        'invalid-email'
      );
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('email');
      }
    });
  });
});
```

### Step 2: Create Step Management Tests

Create `lib/workflow-core/api.steps.new.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  addStep,
  removeStep,
  updateStep,
  duplicateStep
} from './api';
import type { Flow, Step } from './generated';

describe('Step Management API', () => {
  const baseWorkflow: Flow = {
    schema: 'flowspec.v1',
    id: 'test.v1',
    title: 'Test',
    owner: 'test@example.com',
    steps: [
      {
        id: 'existing_step',
        role: 'human',
        instructions: ['Do something'],
        acceptance: ['Done']
      }
    ]
  };
  
  const newStep: Step = {
    id: 'new_step',
    role: 'ai',
    instructions: ['Process data'],
    acceptance: ['Data processed']
  };
  
  describe('addStep', () => {
    it('should add step successfully', () => {
      const result = addStep(baseWorkflow, newStep);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(2);
        expect(result.data.steps?.[1].id).toBe('new_step');
      }
    });
    
    it('should add step at specific position', () => {
      const result = addStep(baseWorkflow, newStep, 0);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps?.[0].id).toBe('new_step');
        expect(result.data.steps?.[1].id).toBe('existing_step');
      }
    });
    
    it('should reject duplicate ID', () => {
      const duplicate = { ...newStep, id: 'existing_step' };
      const result = addStep(baseWorkflow, duplicate);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('exists');
      }
    });
    
    it('should validate required fields', () => {
      const invalid: any = { id: 'test' };  // Missing required fields
      const result = addStep(baseWorkflow, invalid);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('required');
      }
    });
  });
  
  describe('removeStep', () => {
    it('should remove step successfully', () => {
      const result = removeStep(baseWorkflow, 'existing_step');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(0);
      }
    });
    
    it('should handle non-existent step', () => {
      const result = removeStep(baseWorkflow, 'non_existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });
    
    it('should clean up references to removed step', () => {
      const workflowWithRefs: Flow = {
        ...baseWorkflow,
        steps: [
          {
            id: 'step1',
            role: 'human',
            instructions: ['Do A'],
            acceptance: ['Done'],
            next: { success: 'step2', failure: 'step3' }
          },
          {
            id: 'step2',
            role: 'ai',
            instructions: ['Process'],
            acceptance: ['Processed']
          },
          {
            id: 'step3',
            role: 'human',
            instructions: ['Review'],
            acceptance: ['Reviewed']
          }
        ]
      };
      
      const result = removeStep(workflowWithRefs, 'step2');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.success).toBeUndefined();
        expect(step1?.next?.failure).toBe('step3');
      }
    });
  });
  
  describe('updateStep', () => {
    it('should update step properties', () => {
      const result = updateStep(baseWorkflow, 'existing_step', {
        title: 'Updated Title',
        role: 'ai'
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step = result.data.steps?.[0];
        expect(step?.title).toBe('Updated Title');
        expect(step?.role).toBe('ai');
        expect(step?.id).toBe('existing_step');  // ID unchanged
      }
    });
    
    it('should handle non-existent step', () => {
      const result = updateStep(baseWorkflow, 'non_existent', {
        title: 'New'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });
    
    it('should not allow ID change', () => {
      const result = updateStep(baseWorkflow, 'existing_step', {
        id: 'new_id'  // Should be ignored
      } as any);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps?.[0].id).toBe('existing_step');
      }
    });
  });
  
  describe('duplicateStep', () => {
    it('should duplicate step with new ID', () => {
      const result = duplicateStep(baseWorkflow, 'existing_step', 'copy_step');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(2);
        expect(result.data.steps?.[1].id).toBe('copy_step');
        expect(result.data.steps?.[1].role).toBe('human');
      }
    });
    
    it('should add (Copy) to title', () => {
      const workflow: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            title: 'Original'
          }
        ]
      };
      
      const result = duplicateStep(workflow, 'existing_step', 'copy');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps?.[1].title).toContain('Copy');
      }
    });
    
    it('should not duplicate next conditions', () => {
      const workflow: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: { success: 'other_step' }
          }
        ]
      };
      
      const result = duplicateStep(workflow, 'existing_step', 'copy');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const copy = result.data.steps?.[1];
        expect(copy?.next).toBeUndefined();
      }
    });
  });
});
```

### Step 3: Create Edge Management Tests

Create `lib/workflow-core/api.edges.new.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  addEdge,
  removeEdge,
  updateEdge
} from './api';
import type { Flow } from './generated';

describe('Edge Management API', () => {
  const baseWorkflow: Flow = {
    schema: 'flowspec.v1',
    id: 'test.v1',
    title: 'Test',
    owner: 'test@example.com',
    steps: [
      {
        id: 'step1',
        role: 'human',
        instructions: ['Do A'],
        acceptance: ['Done']
      },
      {
        id: 'step2',
        role: 'ai',
        instructions: ['Process'],
        acceptance: ['Processed']
      },
      {
        id: 'step3',
        role: 'human',
        instructions: ['Review'],
        acceptance: ['Reviewed']
      }
    ]
  };
  
  describe('addEdge', () => {
    it('should add edge successfully', () => {
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'success');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.success).toBe('step2');
      }
    });
    
    it('should validate condition format', () => {
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'Invalid-Condition');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('lowercase');
      }
    });
    
    it('should prevent duplicate conditions', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = addEdge(workflow, 'step1', 'step3', 'success');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('exists');
      }
    });
    
    it('should detect circular dependencies', () => {
      // Create a chain: step1 -> step2 -> step3
      let workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      workflow.steps![1].next = { success: 'step3' };
      
      // Try to create cycle: step3 -> step1
      const result = addEdge(workflow, 'step3', 'step1', 'loop');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('circular');
      }
    });
  });
  
  describe('removeEdge', () => {
    it('should remove edge successfully', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { 
        success: 'step2',
        failure: 'step3'
      };
      
      const result = removeEdge(workflow, 'step1', 'success');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.success).toBeUndefined();
        expect(step1?.next?.failure).toBe('step3');
      }
    });
    
    it('should remove next object if no edges remain', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = removeEdge(workflow, 'step1', 'success');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toBeUndefined();
      }
    });
  });
  
  describe('updateEdge', () => {
    it('should update edge condition', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = updateEdge(workflow, 'step1', 'success', 'approved');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.success).toBeUndefined();
        expect(step1?.next?.approved).toBe('step2');
      }
    });
    
    it('should update edge target', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = { success: 'step2' };
      
      const result = updateEdge(workflow, 'step1', 'success', 'success', 'step3');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.success).toBe('step3');
      }
    });
  });
});
```

### Step 4: Create Test Runner Script

Create `scripts/run-all-tests.py`:

```python
#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path

def run_tests():
    """Run all tests and generate coverage report"""
    
    print("🧪 Running all tests...\n")
    
    # Run tests with coverage
    result = subprocess.run(
        ['pnpm', 'test', '--coverage'],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    
    if result.returncode != 0:
        print("❌ Some tests failed")
        print(result.stderr)
        return False
    
    # Check coverage percentage from output
    if 'Coverage' in result.stdout:
        lines = result.stdout.split('\n')
        for line in lines:
            if 'All files' in line or 'workflow-core' in line:
                print(f"Coverage: {line.strip()}")
    
    return True

def check_test_files():
    """Verify all test files exist"""
    test_files = [
        'lib/workflow-core/api.core.test.ts',
        'lib/workflow-core/api.steps.new.test.ts',
        'lib/workflow-core/api.edges.new.test.ts'
    ]
    
    missing = []
    for file in test_files:
        if not Path(file).exists():
            missing.append(file)
    
    if missing:
        print("⚠️ Missing test files:")
        for file in missing:
            print(f"  - {file}")
        return False
    
    return True

def count_tests():
    """Count total number of tests"""
    result = subprocess.run(
        ['grep', '-r', "it('", 'lib/workflow-core', '--include=*.test.ts'],
        capture_output=True,
        text=True
    )
    
    test_count = len(result.stdout.strip().split('\n')) if result.stdout else 0
    print(f"\n📊 Total test cases: {test_count}")
    
    return test_count

def main():
    print("="*50)
    print("TEST COVERAGE IMPROVEMENT")
    print("="*50)
    
    if not check_test_files():
        print("\n⚠️ Create missing test files first")
        sys.exit(1)
    
    test_count = count_tests()
    
    if test_count < 50:
        print(f"\n⚠️ Only {test_count} tests found. Target is 50+")
    
    if run_tests():
        print("\n✅ All tests passing!")
        print("Run 'pnpm test --coverage' to see detailed coverage")
        sys.exit(0)
    else:
        print("\n❌ Fix failing tests")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria

- [ ] All core API functions have tests
- [ ] Each function has at least 3 test cases
- [ ] Success and failure cases are tested
- [ ] Edge cases are covered
- [ ] Result pattern is tested
- [ ] Total of 50+ test cases
- [ ] All tests pass
- [ ] Coverage reaches 80%+

## Testing Commands

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test api.core.test

# Run test verification
python3 scripts/run-all-tests.py
```

## Common Test Patterns

### Testing Result<T> Functions

```typescript
// Always test both success and error cases
const result = someFunction();
if (result.success) {
  expect(result.data).toBeDefined();
  // Test data properties
} else {
  expect(result.error).toBeDefined();
  // Test error message
}
```

### Testing Validation

```typescript
// Test both valid and invalid inputs
const errors = validateWorkflow(workflow);
const criticalErrors = errors.filter(e => e.severity === 'error');
expect(criticalErrors.length).toBe(0);  // For valid
expect(errors.some(e => e.field === 'id')).toBe(true);  // For invalid
```

## Estimated Time: 3 hours

Comprehensive tests are essential for:

1. Ensuring correctness before Phase 4
1. Providing a safety net during refactoring
1. Documenting expected behavior
1. Validating the Rust migration later