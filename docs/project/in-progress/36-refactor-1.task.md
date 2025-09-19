# Refactor 1: Remove Framework Dependencies from Core

## Objective

Remove all React, Next.js, and browser-specific dependencies from the `lib/workflow-core` module to ensure it remains a pure, framework-agnostic library suitable for Rust migration.

## Issue

The analysis found React/Next dependencies in core files, violating the clean architecture principle. The core should be pure TypeScript with no UI framework dependencies.

## Files to Fix

Based on the report, these files have framework dependencies:

- `lib/workflow-core/history-manager.ts`
- `lib/workflow-core/api.ts`
- `lib/workflow-core/templates.ts`
- `lib/workflow-core/flow-to-nodes.ts`
- `lib/workflow-core/generated/flowspec.d.ts`

## Implementation Steps

### Step 1: Remove React from flow-to-nodes.ts

The `flow-to-nodes.ts` file should return plain data structures, not React components.

**Current (incorrect):**

```typescript
import React from 'react';
// or
import { ReactNode } from 'react';
```

**Fix to:**

```typescript
// Remove all React imports
// Return plain objects that the UI layer can convert to React components

export interface NodeData {
  id: string;
  label: string;
  role: string;
  // ... other properties
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export function flowToNodes(flow: Flow): {
  nodes: NodeData[];
  edges: EdgeData[];
} {
  // Return plain data, not React components
}
```

### Step 2: Remove ‘use client’ directives

Search for and remove all `'use client';` directives from core files:

```typescript
// Remove this line from all core files:
'use client';
```

### Step 3: Remove Next.js specific imports

Check for and remove:

- `import { ... } from 'next/...';`
- `import type { ... } from 'next/...';`

### Step 4: Check generated files

The generated files shouldn’t have framework deps. If they do, check the proto generation script:

```typescript
// lib/workflow-core/generated/flowspec.d.ts
// Should only contain type definitions, no imports from React/Next
```

### Step 5: Move React-specific logic to components

If `flow-to-nodes.ts` has React-specific logic, create a wrapper in the components layer:

Create `components/workflow-graph/flow-converter.ts`:

```typescript
'use client';

import { flowToNodes } from '@/lib/workflow-core/flow-to-nodes';
import type { Node, Edge } from 'reactflow';

export function flowToReactFlow(flow: Flow): {
  nodes: Node[];
  edges: Edge[];
} {
  const { nodes, edges } = flowToNodes(flow);
  
  // Convert plain data to React Flow specific format
  return {
    nodes: nodes.map(n => ({
      id: n.id,
      type: 'step',
      position: n.position,
      data: n
    })),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep'
    }))
  };
}
```

### Step 6: Create verification script

Create `scripts/verify-no-framework-deps.py`:

```python
#!/usr/bin/env python3
import os
import sys
from pathlib import Path

def check_framework_deps():
    """Check for framework dependencies in core"""
    core_dir = Path('lib/workflow-core')
    violations = []
    
    forbidden_patterns = [
        "'use client'",
        "from 'react'",
        'from "react"',
        "from 'next",
        'from "next',
        'ReactNode',
        'JSX.Element',
        'React.FC',
        'React.Component'
    ]
    
    for ts_file in core_dir.rglob('*.ts'):
        if 'test' in str(ts_file):
            continue
            
        content = ts_file.read_text()
        
        for pattern in forbidden_patterns:
            if pattern in content:
                violations.append({
                    'file': str(ts_file.relative_to(Path.cwd())),
                    'pattern': pattern
                })
    
    if violations:
        print("❌ Framework dependencies found in core:")
        for v in violations:
            print(f"  - {v['file']}: contains '{v['pattern']}'")
        return False
    
    print("✅ No framework dependencies in core")
    return True

def check_imports():
    """Verify imports are correct"""
    core_dir = Path('lib/workflow-core')
    
    for ts_file in core_dir.glob('*.ts'):
        if 'test' in str(ts_file) or 'generated' in str(ts_file):
            continue
            
        content = ts_file.read_text()
        
        # Should import from generated
        if 'Flow' in content or 'Step' in content:
            if 'from ./generated' not in content and "from './generated'" not in content:
                print(f"⚠️ {ts_file.name} should import types from './generated'")
    
    return True

def main():
    if not check_framework_deps():
        sys.exit(1)
    
    check_imports()
    print("\n✅ Core module is framework-agnostic")
    sys.exit(0)

if __name__ == "__main__":
    main()
```

## Expected Changes

### Before:

```typescript
// lib/workflow-core/flow-to-nodes.ts
'use client';
import React from 'react';
import type { Node } from 'reactflow';

export function flowToNodes(flow: Flow): Node[] {
  // ...
}
```

### After:

```typescript
// lib/workflow-core/flow-to-nodes.ts
import type { Flow, Step } from './generated';

export interface GraphNode {
  id: string;
  label: string;
  data: Step;
  position: { x: number; y: number };
}

export function flowToNodes(flow: Flow): GraphNode[] {
  // Pure data transformation, no React
}
```

## Success Criteria

- [ ] No `'use client'` directives in workflow-core
- [ ] No React imports in workflow-core
- [ ] No Next.js imports in workflow-core
- [ ] `flow-to-nodes.ts` returns plain data structures
- [ ] All React-specific logic moved to components layer
- [ ] Verification script passes
- [ ] Can still run `pnpm build` successfully

## Testing

After making changes:

```bash
# Run verification
python3 scripts/verify-no-framework-deps.py

# Ensure types still work
pnpm tsc --noEmit

# Ensure tests pass
pnpm test

# Ensure app still builds
pnpm build
```

## Common Pitfalls

1. Don’t accidentally leave React type imports like `ReactNode`
1. Check for indirect React deps through other imports
1. Ensure generated files aren’t importing React
1. Don’t break the UI - move logic, don’t delete it

## Estimated Time: 2 hours

This refactoring is critical for Rust migration - the core must be completely independent of UI frameworks.