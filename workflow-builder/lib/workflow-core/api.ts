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
        error: new Error('Step missing required fields: id, role, instructions, acceptance')
      };
    }

    // Validate step ID format
    const idPattern = /^[a-z][a-z0-9_]*$/;
    if (!idPattern.test(step.id)) {
      return {
        success: false,
        error: new Error('Step ID must be lowercase with underscores only')
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

    // Insert at position or append
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
    if (!workflow.steps) {
      return {
        success: false,
        error: new Error('Workflow has no steps')
      };
    }

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    
    if (stepIndex === -1) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    
    // Remove the step
    updatedWorkflow.steps!.splice(stepIndex, 1);

    // Clean up references to this step in other steps' next conditions
    if (updatedWorkflow.steps) {
      updatedWorkflow.steps.forEach(step => {
        if (step.next) {
          // Filter out any next conditions that point to the removed step
          step.next = step.next.filter(n => n.to !== stepId);
        }
      });
    }

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
 * Duplicate a step in the workflow
 * @param workflow - Current workflow
 * @param stepId - ID of step to duplicate
 * @param newId - New ID for the duplicated step
 * @returns New workflow with duplicated step
 */
export function duplicateStep(
  workflow: Flow,
  stepId: string,
  newId: string
): Result<Flow> {
  try {
    const step = workflow.steps?.find(s => s.id === stepId);
    
    if (!step) {
      return {
        success: false,
        error: new Error(`Step with ID "${stepId}" not found`)
      };
    }

    // Validate new ID format
    const idPattern = /^[a-z][a-z0-9_]*$/;
    if (!idPattern.test(newId)) {
      return {
        success: false,
        error: new Error('Step ID must be lowercase with underscores only')
      };
    }

    // Check for duplicate ID
    if (workflow.steps?.some(s => s.id === newId)) {
      return {
        success: false,
        error: new Error(`Step with ID "${newId}" already exists`)
      };
    }

    // Create a copy with new ID
    const duplicatedStep: Step = {
      ...JSON.parse(JSON.stringify(step)),
      id: newId,
      title: `${step.title || step.id} (Copy)`
    };

    // Remove next conditions from the duplicate to avoid circular references
    delete duplicatedStep.next;

    // Add the duplicated step after the original
    const originalIndex = workflow.steps!.findIndex(s => s.id === stepId);
    return addStep(workflow, duplicatedStep, originalIndex + 1);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to duplicate step')
    };
  }
}

/**
 * Add a new edge between two steps
 * @param workflow - Current workflow
 * @param sourceStepId - ID of source step
 * @param targetStepId - ID of target step
 * @param condition - When condition for the edge
 * @returns New workflow with added edge
 */
export function addEdge(
  workflow: Flow,
  sourceStepId: string,
  targetStepId: string,
  condition: string
): Result<Flow> {
  try {
    // Validate both steps exist
    const sourceStep = workflow.steps?.find(s => s.id === sourceStepId);
    const targetStep = workflow.steps?.find(s => s.id === targetStepId);
    
    if (!sourceStep) {
      return {
        success: false,
        error: new Error(`Source step "${sourceStepId}" not found`)
      };
    }
    
    if (!targetStep) {
      return {
        success: false,
        error: new Error(`Target step "${targetStepId}" not found`)
      };
    }
    
    // Validate condition format (lowercase with underscores)
    const conditionPattern = /^[a-z][a-z0-9_]*$/;
    if (!conditionPattern.test(condition)) {
      return {
        success: false,
        error: new Error('Condition must be lowercase with underscores only')
      };
    }
    
    // Check for circular dependency
    if (wouldCreateCycle(workflow, sourceStepId, targetStepId)) {
      return {
        success: false,
        error: new Error('This connection would create a circular dependency')
      };
    }
    
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    const updatedStep = updatedWorkflow.steps!.find(s => s.id === sourceStepId)!;
    
    if (!updatedStep.next) {
      updatedStep.next = [];
    }
    
    // Check if condition already exists for this step
    if (updatedStep.next.some(n => n.when === condition)) {
      return {
        success: false,
        error: new Error(`Condition "${condition}" already exists for this step`)
      };
    }
    
    updatedStep.next.push({ to: targetStepId, when: condition });
    
    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to add edge')
    };
  }
}

/**
 * Update an existing edge
 * @param workflow - Current workflow
 * @param sourceStepId - ID of source step
 * @param edgeIndex - Index of edge in next array
 * @param newCondition - New condition name
 * @param newTargetId - New target step ID (optional)
 * @returns New workflow with updated edge
 */
export function updateEdge(
  workflow: Flow,
  sourceStepId: string,
  edgeIndex: number,
  newCondition: string,
  newTargetId?: string
): Result<Flow> {
  try {
    const sourceStep = workflow.steps?.find(s => s.id === sourceStepId);
    
    if (!sourceStep || !sourceStep.next) {
      return {
        success: false,
        error: new Error(`Source step "${sourceStepId}" not found or has no edges`)
      };
    }
    
    if (edgeIndex < 0 || edgeIndex >= sourceStep.next.length) {
      return {
        success: false,
        error: new Error(`Edge index ${edgeIndex} out of bounds`)
      };
    }
    
    // If updating target, validate it exists
    if (newTargetId && !workflow.steps?.find(s => s.id === newTargetId)) {
      return {
        success: false,
        error: new Error(`Target step "${newTargetId}" not found`)
      };
    }
    
    // Validate new condition format
    const conditionPattern = /^[a-z][a-z0-9_]*$/;
    if (!conditionPattern.test(newCondition)) {
      return {
        success: false,
        error: new Error('Condition must be lowercase with underscores only')
      };
    }
    
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    const updatedStep = updatedWorkflow.steps!.find(s => s.id === sourceStepId)!;
    
    const currentEdge = updatedStep.next![edgeIndex];
    const targetId = newTargetId || currentEdge.to;
    
    // Check for condition conflicts (excluding current edge)
    const otherEdges = updatedStep.next!.filter((_, i) => i !== edgeIndex);
    if (otherEdges.some(edge => edge.when === newCondition)) {
      return {
        success: false,
        error: new Error(`Condition "${newCondition}" already exists for this step`)
      };
    }
    
    // Check for circular dependency if target changed
    if (newTargetId && newTargetId !== currentEdge.to) {
      if (wouldCreateCycle(workflow, sourceStepId, newTargetId)) {
        return {
          success: false,
          error: new Error('This connection would create a circular dependency')
        };
      }
    }
    
    updatedStep.next![edgeIndex] = { to: targetId, when: newCondition };
    
    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to update edge')
    };
  }
}

/**
 * Remove an edge from a step
 * @param workflow - Current workflow
 * @param sourceStepId - ID of source step
 * @param edgeIndex - Index of edge to remove
 * @returns New workflow without the edge
 */
export function removeEdge(
  workflow: Flow,
  sourceStepId: string,
  edgeIndex: number
): Result<Flow> {
  try {
    const sourceStep = workflow.steps?.find(s => s.id === sourceStepId);
    
    if (!sourceStep || !sourceStep.next) {
      return {
        success: false,
        error: new Error(`Source step "${sourceStepId}" not found or has no edges`)
      };
    }
    
    if (edgeIndex < 0 || edgeIndex >= sourceStep.next.length) {
      return {
        success: false,
        error: new Error(`Edge index ${edgeIndex} out of bounds`)
      };
    }
    
    const updatedWorkflow: Flow = JSON.parse(JSON.stringify(workflow));
    const updatedStep = updatedWorkflow.steps!.find(s => s.id === sourceStepId)!;
    
    updatedStep.next!.splice(edgeIndex, 1);
    
    // If no edges remain, remove the next array entirely
    if (updatedStep.next!.length === 0) {
      delete updatedStep.next;
    }
    
    return {
      success: true,
      data: updatedWorkflow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to remove edge')
    };
  }
}

/**
 * Helper function to detect if adding an edge would create a cycle
 * @param workflow - Current workflow
 * @param sourceId - Source step ID
 * @param targetId - Target step ID
 * @returns True if cycle would be created
 */
function wouldCreateCycle(
  workflow: Flow,
  sourceId: string,
  targetId: string
): boolean {
  // Simple DFS to check if targetId can reach sourceId
  const visited = new Set<string>();
  const stack = [targetId];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (current === sourceId) {
      return true; // Found cycle
    }
    
    if (visited.has(current)) {
      continue;
    }
    
    visited.add(current);
    
    const step = workflow.steps?.find(s => s.id === current);
    if (step?.next) {
      for (const nextStep of step.next) {
        if (nextStep.to && !visited.has(nextStep.to)) {
          stack.push(nextStep.to);
        }
      }
    }
  }
  
  return false;
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
