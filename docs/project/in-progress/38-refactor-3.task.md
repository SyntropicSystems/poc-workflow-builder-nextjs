# Refactor 3: Fix Type Imports to Use Generated Types

## Objective

Ensure all TypeScript files use the generated Protobuf types consistently, not handwritten type definitions.

## Issue

The analysis found that many files use Flow/Step types but don’t import them from the generated types. This breaks the principle of Protobuf being the single source of truth.

## Files to Fix

Based on the report, these files need import fixes:

- `lib/workflow-core/api.ts`
- `lib/workflow-core/templates.ts`
- `lib/workflow-core/parser.ts`
- `lib/workflow-core/validator.ts`
- `lib/workflow-core/flow-to-nodes.ts`
- `lib/workflow-core/index.ts`
- All test files in `lib/workflow-core/*.test.ts`

## Implementation Steps

### Step 1: Verify Generated Types Export

First, ensure `lib/workflow-core/generated/index.ts` properly exports all types:

```typescript
// lib/workflow-core/generated/index.ts
export * from './flowspec';

// Ensure these types are available:
export type {
  Flow,
  Step,
  Policy,
  Token,
  Condition,
  Next
} from './flowspec';
```

### Step 2: Update Core API Imports

Fix `lib/workflow-core/api.ts`:

**Before:**

```typescript
// Missing or incorrect imports
interface Flow { ... }  // Handwritten type
type Step = { ... }     // Handwritten type
```

**After:**

```typescript
import type { Flow, Step, Policy } from './generated';
import { Result, ValidationError } from './types';
import * as yaml from 'js-yaml';

// Use only imported types, no local definitions
```

### Step 3: Update Templates Imports

Fix `lib/workflow-core/templates.ts`:

```typescript
import type { Flow, Step } from './generated';

// Remove any local type definitions
// Remove any 'any' types - use proper types

export const WORKFLOW_TEMPLATES: Record<string, Flow> = {
  blank: {
    schema: 'flowspec.v1',
    id: 'template.blank.v1',
    title: 'Blank Workflow',
    owner: 'template@example.com',
    steps: []
  },
  // ... other templates
};

export const STEP_TEMPLATES: Record<string, Partial<Step>> = {
  human_review: {
    role: 'human',
    title: 'Review',
    instructions: ['Review the content'],
    acceptance: ['Review complete']
  },
  // ... other templates
};
```

### Step 4: Update Parser Imports

Fix `lib/workflow-core/parser.ts`:

```typescript
import type { Flow, Step } from './generated';
import * as yaml from 'js-yaml';
import { Result } from './types';

export function parseWorkflowYAML(content: string): Result<Flow> {
  // Implementation using imported Flow type
}
```

### Step 5: Update Validator Imports

Fix `lib/workflow-core/validator.ts`:

```typescript
import type { Flow, Step, Policy } from './generated';
import { ValidationError } from './types';

export function validateFlow(flow: Flow): ValidationError[] {
  // Use imported types
}

export function validateStep(step: Step): ValidationError[] {
  // Use imported types
}
```

### Step 6: Update Test Files

Fix all test files to import from API/generated:

```typescript
// lib/workflow-core/api.test.ts
import { describe, it, expect } from 'vitest';
import type { Flow, Step } from './generated';
import { loadWorkflow, saveWorkflow, validateWorkflow } from './api';

describe('API Functions', () => {
  const validFlow: Flow = {  // Use imported type
    schema: 'flowspec.v1',
    id: 'test.v1',
    title: 'Test',
    owner: 'test@example.com',
    steps: []
  };
  
  // Tests...
});
```

### Step 7: Update Index Exports

Fix `lib/workflow-core/index.ts`:

```typescript
// Re-export types from generated
export type { Flow, Step, Policy, Token } from './generated';

// Export Result and ValidationError from types
export type { Result, ValidationError } from './types';

// Export all API functions
export {
  loadWorkflow,
  saveWorkflow,
  validateWorkflow,
  createWorkflow,
  createWorkflowFromTemplate,
  addStep,
  removeStep,
  updateStep,
  duplicateStep,
  addEdge,
  removeEdge,
  updateEdge
} from './api';

// Export templates
export { WORKFLOW_TEMPLATES, STEP_TEMPLATES } from './templates';
```

### Step 8: Remove Any Type Usage

Search for and fix all `any` types:

**Before:**

```typescript
const template: any = TEMPLATES[templateId];
const parsed = yaml.load(content) as any;
```

**After:**

```typescript
const template: Flow = TEMPLATES[templateId];
const parsed = yaml.load(content) as unknown;
// Then validate and cast properly:
if (isValidFlow(parsed)) {
  const flow = parsed as Flow;
}
```

### Step 9: Create Type Guard Functions

Add type guards for runtime validation:

```typescript
// lib/workflow-core/types.ts

export function isFlow(obj: unknown): obj is Flow {
  if (!obj || typeof obj !== 'object') return false;
  const flow = obj as any;
  return (
    flow.schema === 'flowspec.v1' &&
    typeof flow.id === 'string' &&
    typeof flow.title === 'string' &&
    typeof flow.owner === 'string'
  );
}

export function isStep(obj: unknown): obj is Step {
  if (!obj || typeof obj !== 'object') return false;
  const step = obj as any;
  return (
    typeof step.id === 'string' &&
    typeof step.role === 'string' &&
    Array.isArray(step.instructions) &&
    Array.isArray(step.acceptance)
  );
}
```

### Step 10: Create Verification Script

Create `scripts/verify-type-imports.py`:

```python
#!/usr/bin/env python3
import re
from pathlib import Path

def check_type_imports():
    core_dir = Path('lib/workflow-core')
    issues = []
    
    for ts_file in core_dir.glob('*.ts'):
        if 'generated' in str(ts_file):
            continue
            
        content = ts_file.read_text()
        
        # Check if file uses Flow or Step
        uses_types = ('Flow' in content or 'Step' in content or 
                     'Policy' in content or 'Token' in content)
        
        if uses_types:
            # Check for proper import
            has_import = (
                "from './generated'" in content or
                'from "./generated"' in content or
                "from '@/lib/workflow-core/generated'" in content
            )
            
            if not has_import:
                issues.append(str(ts_file.relative_to(Path.cwd())))
        
        # Check for handwritten type definitions
        if re.search(r'(interface|type)\s+(Flow|Step|Policy)\s*{', content):
            issues.append(f"{ts_file.name}: defines types manually")
        
        # Check for 'any' type
        if ': any' in content or '<any>' in content:
            print(f"⚠️ {ts_file.name} uses 'any' type")
    
    if issues:
        print("❌ Type import issues:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    
    print("✅ All files use generated types correctly")
    return True

def check_exports():
    index_file = Path('lib/workflow-core/index.ts')
    generated_index = Path('lib/workflow-core/generated/index.ts')
    
    if not index_file.exists():
        print("❌ Missing lib/workflow-core/index.ts")
        return False
    
    content = index_file.read_text()
    
    # Check for type re-exports
    if 'export type { Flow, Step' not in content:
        print("⚠️ Index doesn't re-export generated types")
    
    # Check for API exports
    required_exports = [
        'loadWorkflow',
        'saveWorkflow',
        'validateWorkflow',
        'createWorkflow'
    ]
    
    for func in required_exports:
        if func not in content:
            print(f"⚠️ Missing export: {func}")
    
    return True

if __name__ == "__main__":
    check_type_imports()
    check_exports()
```

## Success Criteria

- [ ] All files import types from `./generated`
- [ ] No handwritten Flow/Step/Policy interfaces
- [ ] No `any` types used
- [ ] Type guard functions created
- [ ] All test files use imported types
- [ ] Index.ts properly re-exports everything
- [ ] Verification script passes
- [ ] Type checking passes (`pnpm tsc --noEmit`)

## Testing

```bash
# Run verification
python3 scripts/verify-type-imports.py

# Check TypeScript compilation
pnpm tsc --noEmit

# Verify no type errors
grep -r ": any" lib/workflow-core --include="*.ts" --exclude="*.test.ts"
grep -r "as any" lib/workflow-core --include="*.ts" --exclude="*.test.ts"
```

## Common Pitfalls

1. Don’t create local interfaces with same names as generated types
1. Be careful with test files - they also need proper imports
1. Replace `any` with `unknown` and use type guards
1. Don’t import from the .js file, import from the .d.ts or index

## Estimated Time: 1 hour

This ensures Protobuf remains the single source of truth for all types, which is critical for maintaining consistency when migrating to Rust.