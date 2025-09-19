# Phase 1 Critical Fixes

## Fixes to Apply Across All Phase 1 Tasks

### 0. Check [apply fixes script](workflow-builder/scripts/apply-phase-1-fixes.py)
Most or all fixes should be already included in the script. Double check the script and execute it, then fix anything that is left open or was not properly fixed as outlined in this document. 

### 1. TypeScript Version Alignment (Already DONE)
**Issue**: Phase 0 specified 5.9.2, which doesn't exist. Phase 1 says 5.6.2.
**Fix**: Use TypeScript 5.6.2 consistently everywhere.

### 2. Directory Structure & Import Aliases
**Issue**: Components shown under `src/` but tsconfig aliases point to root.
**Decision**: Keep Phase 0 structure (components at root, not under src/)
**Structure**:
```
workflow-builder/
├── app/                    # Next.js app router (at root)
├── components/             # React components (at root)
├── lib/                    # Libraries (at root)
│   ├── workflow-core/
│   ├── fs/
│   └── state/
└── schemas/
```
**tsconfig.json** remains:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

### 3. Client Boundaries
**Rule**: Only add `'use client'` to components that directly use browser APIs (File System API, Zustand hooks).
**DO NOT** add `'use client'` to:
- `app/page.tsx` (the main page)
- `app/layout.tsx`

**DO** add `'use client'` to:
- Components using File System API
- Components using Zustand stores
- Components using React Flow

### 4. File System Type Narrowing
**Issue**: TypeScript doesn't auto-narrow FileSystemHandle to FileSystemFileHandle.
**Fix** in `lib/fs/file-discovery.ts`:
```typescript
if (entry.kind === 'file' && entry.name.endsWith('.flow.yaml')) {
  const file = await (entry as FileSystemFileHandle).getFile();
  // ...
}
```

### 5. React Flow CSS Import
**Issue**: CSS imports in components break Next.js build.
**Fix**: Import React Flow CSS in `app/layout.tsx`:
```typescript
// app/layout.tsx
import 'reactflow/dist/style.css';
```
**Remove** from any component files.

### 6. React Flow State Updates
**Issue**: Graph doesn't refresh when switching files.
**Fix** in `components/workflow-graph/index.tsx`:
```typescript
import { useEffect } from 'react';
// ...
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

useEffect(() => {
  setNodes(initialNodes);
  setEdges(initialEdges);
}, [initialNodes, initialEdges, setNodes, setEdges]);
```

### 7. ID Validation Regex
**Issue**: Regex doesn't match documented pattern.
**Fix** in `lib/workflow-core/validator.ts`:
```typescript
// Change from: /^[a-z0-9_.-]+\.v[0-9]+$/
// To:
/^[a-z0-9_.-]+\.[a-z0-9_.-]+\.v[0-9]+$/
```

### 8. Phase 0 Test Updates
**Issue**: Tests still expect "Not implemented" errors.
**Fix** in `lib/workflow-core/api.shape.test.ts`:
Remove the tests checking for "Not implemented" errors for:
- loadWorkflow
- saveWorkflow
- validateWorkflow

Keep the function signature tests.

## Updated Verification Scripts

### Update verify-directory-access.py
Remove the check for `'use client'` in app/page.tsx:
```python
# Remove this check:
# check_client_directive('app/page.tsx'),
```

### Update all path references
Change from `src/app/` and `src/components/` to:
- `app/`
- `components/`

## File Location Reference

| File | Correct Location |
|------|-----------------|
| page.tsx | `app/page.tsx` |
| layout.tsx | `app/layout.tsx` |
| DirectorySelector | `components/directory-selector.tsx` |
| FileList | `components/file-list.tsx` |
| WorkflowLoader | `components/workflow-loader.tsx` |
| WorkflowViewer | `components/workflow-viewer.tsx` |
| WorkflowGraph | `components/workflow-graph/index.tsx` |
| StepNode | `components/workflow-graph/step-node.tsx` |

## Import Examples

```typescript
// From any component:
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { loadWorkflow } from '@/lib/workflow-core';
import { DirectorySelector } from '@/components/directory-selector';
```

## Success Criteria
- [ ] All components at root level (not under src/)
- [ ] TypeScript 5.6.2 in package.json
- [ ] React Flow CSS imported in layout.tsx only
- [ ] 'use client' only on components that need it
- [ ] Type assertions for FileSystemFileHandle
- [ ] ID validation regex matches pattern
- [ ] Graph updates when switching files
- [ ] All tests pass