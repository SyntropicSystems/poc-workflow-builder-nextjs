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

// Helper functions for Result type
export const Result = {
  /**
   * Create a successful Result
   */
  ok<T>(data: T): Result<T> {
    return { success: true, data };
  },
  
  /**
   * Create an error Result
   */
  err<T>(error: string | Error): Result<T> {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(error)
    };
  },
  
  /**
   * Check if a Result is successful
   */
  isOk<T>(result: Result<T>): result is { success: true; data: T } {
    return result.success === true;
  },
  
  /**
   * Check if a Result is an error
   */
  isErr<T>(result: Result<T>): result is { success: false; error: Error } {
    return result.success === false;
  },
  
  /**
   * Map over a successful Result
   */
  map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
    if (result.success) {
      try {
        return Result.ok(fn(result.data));
      } catch (error) {
        return Result.err(error instanceof Error ? error : new Error(String(error)));
      }
    }
    return result;
  },
  
  /**
   * Chain Result operations
   */
  flatMap<T, U>(result: Result<T>, fn: (data: T) => Result<U>): Result<U> {
    if (result.success) {
      return fn(result.data);
    }
    return result;
  },
  
  /**
   * Unwrap Result or throw error
   */
  unwrap<T>(result: Result<T>): T {
    if (result.success) {
      return result.data;
    }
    throw result.error;
  },
  
  /**
   * Unwrap Result or return default value
   */
  unwrapOr<T>(result: Result<T>, defaultValue: T): T {
    if (result.success) {
      return result.data;
    }
    return defaultValue;
  }
};

// Type guard functions for runtime validation
/**
 * Check if an object is a valid Flow
 */
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

/**
 * Check if an object is a valid Step
 */
export function isStep(obj: unknown): obj is Step {
  if (!obj || typeof obj !== 'object') return false;
  const step = obj as any;
  return (
    typeof step.id === 'string' &&
    typeof step.role === 'string' &&
    Array.isArray(step.instructions) &&
    step.acceptance && typeof step.acceptance === 'object'
  );
}

/**
 * Check if an object is a valid Check
 */
export function isCheck(obj: unknown): obj is Check {
  if (!obj || typeof obj !== 'object') return false;
  const check = obj as any;
  // Check objects can have various properties, but at minimum should be an object
  // with at least one property like description, kind, path, etc.
  return (
    typeof check.description === 'string' ||
    typeof check.kind === 'string' ||
    typeof check.path === 'string'
  );
}

/**
 * Type guard for ValidationError
 */
export function isValidationError(obj: unknown): obj is ValidationError {
  if (!obj || typeof obj !== 'object') return false;
  const err = obj as any;
  return (
    typeof err.path === 'string' &&
    typeof err.message === 'string' &&
    (err.severity === 'error' || err.severity === 'warning')
  );
}
