import type { Flow, Step } from './generated'
import type { Result, ValidationError, WorkflowOptions } from './types'
import { parseYAML, isValidFlowObject } from './parser'
import { validateFlow } from './validator'
import * as yaml from 'js-yaml'

/**
 * Parse and validate a YAML string into a Flow object
 */
export async function loadWorkflow(
  yamlString: string,
  options: WorkflowOptions = {}
): Promise<Result<Flow>> {
  try {
    // Parse YAML
    const parsed = parseYAML(yamlString);
    
    // Basic structure check
    if (!isValidFlowObject(parsed)) {
      return {
        success: false,
        error: new Error('Invalid workflow structure: missing required fields')
      };
    }

    // Validate against schema
    const errors = validateFlow(parsed);
    
    // In strict mode, warnings become errors
    const criticalErrors = options.strict 
      ? errors 
      : errors.filter(e => e.severity === 'error');

    if (criticalErrors.length > 0) {
      const errorMessage = criticalErrors
        .map(e => `${e.path}: ${e.message}`)
        .join('\n');
      return {
        success: false,
        error: new Error(`Validation failed:\n${errorMessage}`)
      };
    }

    // Convert to Flow type (for now, just cast - in real implementation would properly construct)
    const flow = parsed as unknown as Flow;

    return {
      success: true,
      data: flow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Serialize a Flow object back to YAML string
 */
export async function saveWorkflow(
  workflow: Flow
): Promise<Result<string>> {
  try {
    const yamlString = yaml.dump(workflow, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });

    return {
      success: true,
      data: yamlString
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to serialize workflow')
    };
  }
}

/**
 * Validate a Flow object against schema rules
 */
export async function validateWorkflow(
  workflow: Flow,
  options: WorkflowOptions = {}
): Promise<ValidationError[]> {
  return validateFlow(workflow);
}

/**
 * Update a specific step in the workflow
 * @param workflow - Current workflow
 * @param stepId - ID of step to update
 * @param updates - Partial step data to merge
 * @returns New workflow with updated step
 */
export function updateStep(
  workflow: Flow,
  stepId: string,
  updates: Partial<Step>
): Result<Flow> {
  throw new Error('Not implemented: updateStep')
}

/**
 * Add a new step to the workflow
 * @param workflow - Current workflow
 * @param step - New step to add
 * @param position - Optional insertion index
 * @returns New workflow with added step
 */
export function addStep(
  workflow: Flow,
  step: Step,
  position?: number
): Result<Flow> {
  throw new Error('Not implemented: addStep')
}

/**
 * Remove a step from the workflow
 * @param workflow - Current workflow
 * @param stepId - ID of step to remove
 * @returns New workflow without the step
 */
export function removeStep(
  workflow: Flow,
  stepId: string
): Result<Flow> {
  throw new Error('Not implemented: removeStep')
}

/**
 * Create a new workflow from a minimal template
 * @param id - Workflow ID (e.g., "domain.name.v1")
 * @param title - Human-readable title
 * @returns New workflow with minimal valid structure
 */
export function createWorkflowFromTemplate(
  id: string,
  title: string
): Flow {
  throw new Error('Not implemented: createWorkflowFromTemplate')
}
