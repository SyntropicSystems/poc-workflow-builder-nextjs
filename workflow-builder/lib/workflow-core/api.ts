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
    // Validate before saving
    const validation = await validateWorkflow(workflow);
    const hasErrors = validation.filter(e => e.severity === 'error').length > 0;
    
    if (hasErrors) {
      return {
        success: false,
        error: new Error('Cannot save invalid workflow. Fix validation errors first.')
      };
    }

    // Clean up the workflow object before serialization
    // Remove any undefined or null values that shouldn't be in YAML
    const cleanWorkflow = JSON.parse(JSON.stringify(workflow));
    
    // Convert to YAML with proper formatting
    const yamlString = yaml.dump(cleanWorkflow, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true,  // Don't use YAML references
      sortKeys: false // Preserve key order
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
  try {
    const stepIndex = workflow.steps?.findIndex(s => s.id === stepId);
    
    if (stepIndex === undefined || stepIndex === -1) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    // Create a deep copy of the workflow
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    // Apply updates to the step
    if (updatedWorkflow.steps && updatedWorkflow.steps[stepIndex]) {
      updatedWorkflow.steps[stepIndex] = {
        ...updatedWorkflow.steps[stepIndex],
        ...updates,
        id: updatedWorkflow.steps[stepIndex].id // Prevent ID changes
      };
    }

    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to update step')
    };
  }
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
  try {
    // Validate step has required fields
    if (!step.id || !step.role || !step.instructions || !step.acceptance) {
      return {
        success: false,
        error: new Error('Step missing required fields')
      };
    }

    // Check for duplicate ID
    if (workflow.steps?.some(s => s.id === step.id)) {
      return {
        success: false,
        error: new Error(`Step with ID "${step.id}" already exists`)
      };
    }

    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    if (!updatedWorkflow.steps) {
      updatedWorkflow.steps = [];
    }

    if (position !== undefined && position >= 0 && position <= updatedWorkflow.steps.length) {
      updatedWorkflow.steps.splice(position, 0, step);
    } else {
      updatedWorkflow.steps.push(step);
    }

    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to add step')
    };
  }
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
  try {
    const stepIndex = workflow.steps?.findIndex(s => s.id === stepId);
    
    if (stepIndex === undefined || stepIndex === -1) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    // Remove the step
    updatedWorkflow.steps?.splice(stepIndex, 1);

    // Clean up references in other steps' next arrays
    updatedWorkflow.steps?.forEach(step => {
      if (step.next) {
        step.next = step.next.filter(n => n.to !== stepId);
      }
    });

    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to remove step')
    };
  }
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
