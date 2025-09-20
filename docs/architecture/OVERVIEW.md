# Architecture Overview & System Design

### Core Architecture Decisions

**Decision 1: Pure TypeScript POC with Rust-Ready Design**

- **Correct choice**: Building in pure TypeScript/Next.js now while designing for Rust later
- **Rationale**: You get rapid iteration on UX while establishing the right boundaries
- **Key insight**: The protobuf schema + clean API boundary gives you 90% of the architectural learning without the Rust complexity

**Decision 2: Local-First with Browser File System API**

- **Implications**: No server needed, direct filesystem access, perfect for developer tooling
- **Trade-off**: Browser-only (no Node.js CLI), but aligns with visual editor goals
- **Future path**: Can later wrap in Electron/Tauri for native experience

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    UI Layer (React)                   │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │ React Flow   │  │  Inspector  │  │ File Tree  │  │  │
│  │  │  Component   │  │    Panel    │  │   Panel    │  │  │
│  │  └──────────────┘  └─────────────┘  └────────────┘  │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │              State Management (Zustand)                │  │
│  │   - Current workflow (Flow object)                     │  │
│  │   - Directory handle                                   │  │
│  │   - Validation errors                                  │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ═════════════════════════╪═════════════════════════════   │
│         API Boundary      │     (This is the key!)          │
│  ═════════════════════════╪═════════════════════════════   │
│                           │                                  │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │          Workflow Core Library (TypeScript)            │  │
│  │                                                        │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐   │  │
│  │  │ Protobuf Types  │  │   Core Functions         │   │  │
│  │  │  (Generated)    │  │  - loadWorkflow()        │   │  │
│  │  └─────────────────┘  │  - saveWorkflow()        │   │  │
│  │                        │  - validateWorkflow()    │   │  │
│  │  ┌─────────────────┐  │  - updateStep()          │   │  │
│  │  │ YAML Parser     │  │  - createFromTemplate()  │   │  │
│  │  └─────────────────┘  └──────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          File System Access Layer                    │  │
│  │   - Browser File System API wrapper                  │  │
│  │   - Directory traversal                              │  │
│  │   - File read/write operations                       │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

                    ↓ Future Migration Path ↓

┌─────────────────────────────────────────────────────────────┐
│                   Rust Core (WebAssembly)                    │
│  - Same API surface as TypeScript core                       │
│  - Compiled to WASM, imported by Next.js                     │
│  - Drop-in replacement for workflow-core                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Schema-First Development**
- Protobuf as single source of truth
- All data flows through generated types
- Validation at the API boundary
1. **Immutable State Updates**
- Every edit creates a new Flow object
- Enables undo/redo, time-travel debugging
- Aligns with React’s mental model
1. **Error Recovery at Every Layer**
- Parse errors → show raw YAML editor fallback
- Validation errors → highlight specific nodes/fields
- File system errors → clear user messaging
1. **Progressive Enhancement**
- Start with basic node/edge rendering
- Add advanced features (templates, bulk operations) incrementally
- Each phase delivers standalone value

### Module Structure

```
workflow-builder/
├── app/                          # Next.js app router
│   ├── page.tsx                  # Main editor interface
│   └── api/                      # Future: API routes for automation
├── components/
│   ├── workflow-editor/          # React Flow wrapper
│   ├── inspector/                # Property panels
│   └── file-explorer/            # Directory tree
├── lib/
│   ├── workflow-core/            # 🔑 The portable core
│   │   ├── api.ts                # Public API surface
│   │   ├── parser.ts             # YAML ↔ Protobuf
│   │   ├── validator.ts          # Schema validation
│   │   └── generated/            # From protoc
│   ├── fs/                       # File system utilities
│   └── state/                    # Zustand stores
├── schemas/
│   ├── flowspec.v1.proto         # Source of truth
│   └── generated/                # TypeScript from proto
└── scripts/
    └── generate-proto.js         # Build-time codegen
```

### Data Flow Architecture

```
YAML File → Parse → JS Object → Validate → Protobuf Object → UI State
                                              ↓
                                        React Flow Graph
                                              ↓
                                         User Edit
                                              ↓
                                    Update Protobuf Object
                                              ↓
                                          Validate
                                              ↓
                                     Serialize to YAML → Save to File
```

### Critical Success Factors

1. **API Boundary Discipline**: Never let UI components directly manipulate workflow data
1. **Type Safety**: Protobuf types flow through entire system
1. **Validation Everywhere**: Parse-time, edit-time, save-time
1. **Clean Separation**: UI knows nothing about YAML/Protobuf internals

### Risk Mitigation

**Risk**: Complex Protobuf setup might slow initial development

- **Mitigation**: Start with TypeScript interfaces matching the schema, add Protobuf in Phase 0.5

**Risk**: React Flow performance with large workflows

- **Mitigation**: Virtualization, lazy loading of off-screen nodes

**Risk**: File System API browser compatibility

- **Mitigation**: Feature detection with fallback to file upload/download
