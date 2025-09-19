# Master Context for Workflow Builder POC

## Project Overview

Building a visual workflow editor for flowspec.v1 YAML files using Next.js and React Flow. This is a proof of concept focused on UX validation and architectural learning.

## Critical Constraints

- **Stack**: Next.js 15.0.3, React Flow 11.11.4, TypeScript 5.9.2, PNPM
- **No Backend**: Pure frontend application using browser File System API
- **Schema-Driven**: Protobuf as source of truth for data structures
- **Local-First**: Direct filesystem access, no server required
- **Incremental**: Each task must deliver standalone value

## Architecture Rules

1. **API Boundary**: UI components NEVER directly manipulate workflow data. All changes go through `lib/workflow-core/api.ts`
1. **Immutable Updates**: Every edit creates a new Flow object, never mutate
1. **Type Safety**: Use generated Protobuf types everywhere, no `any` types
1. **Validation**: Every data transformation must validate against schema
1. **Error Handling**: All functions return Result-like patterns or throw descriptive errors

## Directory Structure

```
workflow-builder/
├── app/                    # Next.js app router
├── components/             # React components
├── lib/
│   ├── workflow-core/      # Portable core logic (THE KEY MODULE)
│   │   ├── api.ts         # Public API surface
│   │   └── generated/     # From protobuf
│   ├── fs/                # File system utilities
│   └── state/             # State management
├── schemas/
│   ├── flowspec.v1.proto  # Source of truth
│   └── generated/         # TypeScript from proto
└── scripts/               # Build scripts (Python, not bash)
```

## Implementation Guidelines

- **Minimal Code**: Implement ONLY what’s specified in the task. No extra features.
- **No Premature Abstraction**: Don’t create generic solutions for single use cases
- **Clear Boundaries**: Keep modules focused and independent
- **Test First**: Write the test, then the implementation
- **Python Scripts**: Use Python 3 for all build/utility scripts, NOT bash

## Testing Strategy

- **Unit Tests**: Core functions in `lib/workflow-core/`
- **Integration Tests**: File system operations
- **E2E Tests**: Only for critical user journeys (load → edit → save)
- **No UI Tests**: In this POC phase (unless specifically requested)

## Common Pitfalls to Avoid

- Don’t add authentication/authorization
- Don’t implement workflow execution/runners
- Don’t add features not in the task specification
- Don’t optimize prematurely (no caching, virtualization yet)
- Don’t create elaborate error recovery (basic error messages are fine)
- Don’t add telemetry, analytics, or logging frameworks

## FlowSpec v1 Schema Summary

The workflow files follow this structure:

- **Root**: schema, id, title, owner, policy, steps (required)
- **Steps**: Array of step objects with id, role, instructions, acceptance
- **Policy**: enforcement levels (none|advice|guard|hard)
- **Validation**: Must parse as YAML, conform to schema

## Success Criteria for Each Task

Every implementation should:

1. Pass the specified tests
1. Add no dependencies beyond those listed
1. Follow the established patterns
1. Maintain clean git history (one commit per task)
1. Include inline documentation for complex logic only