# Master Context for Workflow Builder POC

## Project Overview
Building a visual workflow editor for flowspec.v1 YAML files using Next.js and React Flow. This is a proof of concept focused on UX validation and architectural learning.

## Current Phase: Phase 1 - Read-Only Viewer
Foundation (Phase 0) is complete with:
- ✅ Next.js project initialized with exact dependencies
- ✅ Protobuf schema translated and TypeScript types generated
- ✅ Core API scaffolding with clean boundary established

## Critical Constraints
- **Stack**: Next.js 15.0.3, React Flow (reactflow) 11.11.4, TypeScript 5.6.2, PNPM
- **No Backend**: Pure frontend application using browser File System API
- **Schema-Driven**: Protobuf as source of truth for data structures
- **Local-First**: Direct filesystem access, no server required
- **Incremental**: Each task must deliver standalone value
- **Client Components**: Any component using File System API must be marked with 'use client'

## Architecture Rules
1. **API Boundary**: UI components NEVER directly manipulate workflow data. All changes go through `lib/workflow-core/api.ts`
2. **Immutable Updates**: Every edit creates a new Flow object, never mutate
3. **Type Safety**: Use generated Protobuf types everywhere, no `any` types
4. **Validation**: Every data transformation must validate against schema
5. **Error Handling**: All functions return Result-like patterns or throw descriptive errors
6. **Client Boundaries**: Components using File System API must have 'use client' directive at the top

## Directory Structure
```
workflow-builder/
├── src/
│   ├── app/                    # Next.js app router
│   └── components/             # React components (use 'use client' for FS access)
├── lib/
│   ├── workflow-core/          # Portable core logic (THE KEY MODULE)
│   │   ├── api.ts             # Public API surface
│   │   ├── types.ts           # Custom types (Result, ValidationError)
│   │   └── generated/         # From protobuf
│   ├── fs/                    # File system utilities (client-only)
│   └── state/                 # State management (Zustand)
├── schemas/
│   └── flowspec.v1.proto      # Source of truth
└── scripts/                    # Build scripts (Python, not bash)
    └── *.py                   # All scripts in Python 3
```

## Implementation Guidelines
- **Minimal Code**: Implement ONLY what's specified in the task. No extra features.
- **No Premature Abstraction**: Don't create generic solutions for single use cases
- **Clear Boundaries**: Keep modules focused and independent
- **Test First**: Write the test, then the implementation
- **Python Scripts**: Use Python 3 for all build/utility scripts, NOT bash
- **Use Existing Types**: Import from `lib/workflow-core/generated` for all Protobuf types

## Testing Strategy
- **Unit Tests**: Core functions in `lib/workflow-core/`
- **Integration Tests**: File system operations
- **E2E Tests**: Only for critical user journeys (load → edit → save)
- **No UI Tests**: In this POC phase (unless specifically requested)

## Common Pitfalls to Avoid
- Don't add authentication/authorization
- Don't implement workflow execution/runners
- Don't add features not in the task specification  
- Don't optimize prematurely (no caching, virtualization yet)
- Don't create elaborate error recovery (basic error messages are fine)
- Don't add telemetry, analytics, or logging frameworks
- Don't modify generated Protobuf files directly

## FlowSpec v1 Schema Summary
The workflow files follow this structure:
- **Root**: schema, id, title, owner, policy, steps (required)
- **Steps**: Array of step objects with id, role, instructions, acceptance
- **Policy**: enforcement levels (none|advice|guard|hard)
- **Validation**: Must parse as YAML, conform to schema
- **Generated Types**: Available in `lib/workflow-core/generated/index.ts`

## Phase 1 Goals (Current)
1. Local directory access via File System API
2. File discovery and listing of .flow.yaml files
3. YAML parsing and validation against Protobuf schema
4. Visual rendering with React Flow (read-only)

## Success Criteria for Each Task
Every implementation should:
1. Pass the specified tests
2. Add no dependencies beyond those listed
3. Follow the established patterns
4. Maintain clean git history (one commit per task)
5. Include inline documentation for complex logic only
6. Use the existing generated types from Phase 0