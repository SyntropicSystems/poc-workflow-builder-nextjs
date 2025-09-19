import type { Flow, Step, Policy, Check } from './generated';
import type { ValidationError } from './types';

export function validateFlow(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push({
      path: '',
      message: 'Workflow must be an object',
      severity: 'error'
    });
    return errors;
  }

  const flow = data as Record<string, unknown>;

  // Validate required root fields
  if (!flow.schema) {
    errors.push({
      path: 'schema',
      message: 'Field "schema" is required',
      severity: 'error'
    });
  } else if (flow.schema !== 'flowspec.v1') {
    errors.push({
      path: 'schema',
      message: `Schema must be "flowspec.v1", got "${flow.schema}"`,
      severity: 'error'
    });
  }

  if (!flow.id) {
    errors.push({
      path: 'id',
      message: 'Field "id" is required',
      severity: 'error'
    });
  } else if (typeof flow.id !== 'string' || !/^[a-z0-9_.-]+\.[a-z0-9_.-]+\.v[0-9]+$/.test(flow.id as string)) {
    // FIX: Regex now matches <domain>.<n>.v<major> pattern
    errors.push({
      path: 'id',
      message: 'ID must match pattern: <domain>.<n>.v<major>',
      severity: 'error'
    });
  }

  if (!flow.title) {
    errors.push({
      path: 'title',
      message: 'Field "title" is required',
      severity: 'error'
    });
  }

  if (!flow.policy) {
    errors.push({
      path: 'policy',
      message: 'Field "policy" is required',
      severity: 'error'
    });
  } else {
    validatePolicy(flow.policy, errors);
  }

  if (!flow.steps) {
    errors.push({
      path: 'steps',
      message: 'Field "steps" is required',
      severity: 'error'
    });
  } else if (!Array.isArray(flow.steps)) {
    errors.push({
      path: 'steps',
      message: 'Steps must be an array',
      severity: 'error'
    });
  } else if (flow.steps.length === 0) {
    errors.push({
      path: 'steps',
      message: 'At least one step is required',
      severity: 'error'
    });
  } else {
    validateSteps(flow.steps as unknown[], errors);
  }

  return errors;
}

function validatePolicy(policy: unknown, errors: ValidationError[]): void {
  if (typeof policy !== 'object' || policy === null) {
    errors.push({
      path: 'policy',
      message: 'Policy must be an object',
      severity: 'error'
    });
    return;
  }

  const p = policy as Record<string, unknown>;
  
  if (!p.enforcement) {
    errors.push({
      path: 'policy.enforcement',
      message: 'Enforcement level is required',
      severity: 'error'
    });
  } else if (!['none', 'advice', 'guard', 'hard'].includes(p.enforcement as string)) {
    errors.push({
      path: 'policy.enforcement',
      message: 'Enforcement must be one of: none, advice, guard, hard',
      severity: 'error'
    });
  }
}

function validateSteps(steps: unknown[], errors: ValidationError[]): void {
  const stepIds = new Set<string>();

  steps.forEach((step, index) => {
    if (typeof step !== 'object' || step === null) {
      errors.push({
        path: `steps[${index}]`,
        message: 'Step must be an object',
        severity: 'error'
      });
      return;
    }

    const s = step as Record<string, unknown>;

    if (!s.id) {
      errors.push({
        path: `steps[${index}].id`,
        message: 'Step ID is required',
        severity: 'error'
      });
    } else if (typeof s.id !== 'string') {
      errors.push({
        path: `steps[${index}].id`,
        message: 'Step ID must be a string',
        severity: 'error'
      });
    } else if (!/^[a-z0-9_]+$/.test(s.id as string)) {
      errors.push({
        path: `steps[${index}].id`,
        message: 'Step ID must be snake_case',
        severity: 'error'
      });
    } else if (stepIds.has(s.id as string)) {
      errors.push({
        path: `steps[${index}].id`,
        message: `Duplicate step ID: ${s.id}`,
        severity: 'error'
      });
    } else {
      stepIds.add(s.id as string);
    }

    if (!s.role) {
      errors.push({
        path: `steps[${index}].role`,
        message: 'Step role is required',
        severity: 'error'
      });
    }

    if (!s.instructions) {
      errors.push({
        path: `steps[${index}].instructions`,
        message: 'Step instructions are required',
        severity: 'error'
      });
    } else if (!Array.isArray(s.instructions)) {
      errors.push({
        path: `steps[${index}].instructions`,
        message: 'Instructions must be an array',
        severity: 'error'
      });
    } else if ((s.instructions as unknown[]).length === 0) {
      errors.push({
        path: `steps[${index}].instructions`,
        message: 'At least one instruction is required',
        severity: 'warning'
      });
    }

    if (!s.acceptance) {
      errors.push({
        path: `steps[${index}].acceptance`,
        message: 'Step acceptance criteria are required',
        severity: 'error'
      });
    } else {
      validateAcceptance(s.acceptance, `steps[${index}].acceptance`, errors);
    }
  });
}

function validateAcceptance(acceptance: unknown, path: string, errors: ValidationError[]): void {
  if (typeof acceptance !== 'object' || acceptance === null) {
    errors.push({
      path,
      message: 'Acceptance must be an object',
      severity: 'error'
    });
    return;
  }

  const a = acceptance as Record<string, unknown>;

  if (!a.checks) {
    errors.push({
      path: `${path}.checks`,
      message: 'Acceptance checks are required',
      severity: 'error'
    });
  } else if (!Array.isArray(a.checks)) {
    errors.push({
      path: `${path}.checks`,
      message: 'Checks must be an array',
      severity: 'error'
    });
  } else if ((a.checks as unknown[]).length === 0) {
    errors.push({
      path: `${path}.checks`,
      message: 'At least one check is required',
      severity: 'warning'
    });
  }
}
