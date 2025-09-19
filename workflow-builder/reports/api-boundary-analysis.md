# API Boundary Analysis Report

## Summary
- API Functions: 8
- Components Analyzed: 1
- Violations Found: 1

## ⚠️ VIOLATIONS

### components/workflow-loader.tsx
- Validation logic outside API

## 📋 Recommendations

- CRITICAL: Move all business logic to lib/workflow-core/api.ts
- Missing expected API functions: saveWorkflow, loadWorkflow, validateWorkflow, createWorkflow

## API Functions Found

- `addEdge()`
- `addStep()`
- `createWorkflowFromTemplate()`
- `duplicateStep()`
- `removeEdge()`
- `removeStep()`
- `updateEdge()`
- `updateStep()`
