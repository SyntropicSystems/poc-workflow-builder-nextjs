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
