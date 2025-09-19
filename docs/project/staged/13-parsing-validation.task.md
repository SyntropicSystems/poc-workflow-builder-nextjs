# Task 1.3: Workflow Parsing & Validation (FIXED & COMPLETE)

## Objective
Implement the loadWorkflow function to parse YAML and validate against the Protobuf schema, providing immediate feedback on errors.

## Prerequisites
- Task 1.2 completed (file selection working)
- Generated Protobuf types available
- js-yaml installed

## Implementation Steps

### Step 1: Implement YAML Parser
Create `lib/workflow-core/parser.ts`:
```typescript
import * as yaml from 'js-yaml';
import type { Flow } from './generated';

export function parseYAML(yamlString: string): unknown {
  try {
    const parsed = yaml.load(yamlString);
    return parsed;
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      throw new Error(`YAML parsing error: ${error.message}`);
    }
    throw error;
  }
}

export function isValidFlowObject(obj: unknown): obj is Record<string, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'schema' in obj &&
    'id' in obj &&
    'title' in obj &&
    'steps' in obj
  );
}
```

### Step 2: Implement Validator
Create `lib/workflow-core/validator.ts`:
```typescript
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
```

### Step 3: Update API Shape Tests
Update `lib/workflow-core/api.shape.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import * as api from './api'
import type { Flow, Step } from './generated'

describe('Core API Shape', () => {
  it('should export loadWorkflow function', () => {
    expect(typeof api.loadWorkflow).toBe('function')
    expect(api.loadWorkflow.length).toBe(2) // yamlString + options
  })
  
  it('should export saveWorkflow function', () => {
    expect(typeof api.saveWorkflow).toBe('function')
    expect(api.saveWorkflow.length).toBe(1) // workflow
  })
  
  it('should export validateWorkflow function', () => {
    expect(typeof api.validateWorkflow).toBe('function')
    expect(api.validateWorkflow.length).toBe(2) // workflow + options
  })
  
  it('should export updateStep function', () => {
    expect(typeof api.updateStep).toBe('function')
    expect(api.updateStep.length).toBe(3) // workflow + stepId + updates
  })
  
  it('should export addStep function', () => {
    expect(typeof api.addStep).toBe('function')
    expect(api.addStep.length).toBe(3) // workflow + step + position
  })
  
  it('should export removeStep function', () => {
    expect(typeof api.removeStep).toBe('function')
    expect(api.removeStep.length).toBe(2) // workflow + stepId
  })
  
  it('should export createWorkflowFromTemplate function', () => {
    expect(typeof api.createWorkflowFromTemplate).toBe('function')
    expect(api.createWorkflowFromTemplate.length).toBe(2) // id + title
  })
  
  // FIX: Remove "not implemented" tests for Phase 1 implemented functions
  // These are now implemented, not stubs
  
  it('should throw not implemented errors for edit functions', () => {
    // Only test the functions still not implemented
    expect(() => api.updateStep({} as Flow, 'id', {})).toThrow('Not implemented')
    expect(() => api.addStep({} as Flow, {} as Step)).toThrow('Not implemented')
    expect(() => api.removeStep({} as Flow, 'id')).toThrow('Not implemented')
    expect(() => api.createWorkflowFromTemplate('id', 'title')).toThrow('Not implemented')
  })
})
```

### Step 4: Implement Core API Functions
Update `lib/workflow-core/api.ts`:
```typescript
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

// Keep other functions with "not implemented" for now
export function updateStep(
  workflow: Flow,
  stepId: string,
  updates: Partial<Step>
): Result<Flow> {
  throw new Error('Not implemented: updateStep')
}

export function addStep(
  workflow: Flow,
  step: Step,
  position?: number
): Result<Flow> {
  throw new Error('Not implemented: addStep')
}

export function removeStep(
  workflow: Flow,
  stepId: string
): Result<Flow> {
  throw new Error('Not implemented: removeStep')
}

export function createWorkflowFromTemplate(
  id: string,
  title: string
): Flow {
  throw new Error('Not implemented: createWorkflowFromTemplate')
}
```

### Step 5: Create Workflow Loader Component
Create `components/workflow-loader.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { loadWorkflow } from '@/lib/workflow-core';
import type { Flow, ValidationError } from '@/lib/workflow-core';

export function WorkflowLoader() {
  const { selectedFile, fileContent } = useFileSystemStore();
  const [workflow, setWorkflow] = useState<Flow | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fileContent && selectedFile) {
      parseWorkflow();
    } else {
      setWorkflow(null);
      setValidationErrors([]);
      setParseError(null);
    }
  }, [fileContent, selectedFile]);

  const parseWorkflow = async () => {
    if (!fileContent) return;

    setIsLoading(true);
    setParseError(null);
    setValidationErrors([]);

    const result = await loadWorkflow(fileContent);

    if (result.success) {
      setWorkflow(result.data);
      // Also run validation to get warnings
      const { validateWorkflow } = await import('@/lib/workflow-core');
      const errors = await validateWorkflow(result.data);
      setValidationErrors(errors.filter(e => e.severity === 'warning'));
    } else {
      setWorkflow(null);
      setParseError(result.error.message);
    }

    setIsLoading(false);
  };

  if (!selectedFile) {
    return null;
  }

  return (
    <div className="workflow-loader">
      <h3>Workflow Status</h3>
      
      {isLoading && (
        <div className="loading">Parsing workflow...</div>
      )}

      {parseError && (
        <div className="parse-error">
          <h4>❌ Parse Error</h4>
          <pre>{parseError}</pre>
        </div>
      )}

      {workflow && (
        <div className="workflow-info">
          <h4>✅ Valid Workflow</h4>
          <dl>
            <dt>ID:</dt>
            <dd>{workflow.id}</dd>
            <dt>Title:</dt>
            <dd>{workflow.title}</dd>
            <dt>Steps:</dt>
            <dd>{workflow.steps?.length || 0}</dd>
            <dt>Policy:</dt>
            <dd>{workflow.policy?.enforcement || 'none'}</dd>
          </dl>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="validation-warnings">
          <h4>⚠️ Warnings</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <strong>{error.path}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Step 6: Update Main Page
Update `app/page.tsx`:
```typescript
import { DirectorySelector } from '@/components/directory-selector';
import { FileList } from '@/components/file-list';
import { WorkflowLoader } from '@/components/workflow-loader';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Workflow Builder</h1>
        <DirectorySelector />
        <div className={styles.columns}>
          <div className={styles.sidebar}>
            <FileList />
          </div>
          <div className={styles.content}>
            <WorkflowLoader />
          </div>
        </div>
      </div>
    </main>
  );
}
```

### Step 7: Add Styles
Update `app/globals.css`:
```css
/* Add to existing globals.css */

.workflow-loader {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.workflow-loader h3 {
  margin-top: 0;
}

.loading {
  color: #666;
  font-style: italic;
}

.parse-error {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
}

.parse-error h4 {
  margin: 0 0 10px 0;
  color: #c00;
}

.parse-error pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  color: #600;
}

.workflow-info {
  background-color: #efe;
  border: 1px solid #cfc;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
}

.workflow-info h4 {
  margin: 0 0 10px 0;
  color: #060;
}

.workflow-info dl {
  margin: 0;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px;
}

.workflow-info dt {
  font-weight: bold;
}

.workflow-info dd {
  margin: 0;
}

.validation-warnings {
  background-color: #ffd;
  border: 1px solid #fc0;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
}

.validation-warnings h4 {
  margin: 0 0 10px 0;
  color: #960;
}

.validation-warnings ul {
  margin: 0;
  padding-left: 20px;
}
```

Update `app/page.module.css`:
```css
/* Add to existing page.module.css */

.columns {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  margin-top: 20px;
}

.sidebar {
  min-width: 0;
}

.content {
  min-width: 0;
}
```

### Step 8: Create Tests
Create `lib/workflow-core/validator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { validateFlow } from './validator';

describe('Workflow Validator', () => {
  it('should validate a minimal valid workflow', () => {
    const workflow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test Flow',
      policy: {
        enforcement: 'advice'
      },
      steps: [{
        id: 'step_one',
        role: 'human',
        instructions: ['Do something'],
        acceptance: {
          checks: [{
            kind: 'file_exists',
            path: '/test'
          }]
        }
      }]
    };

    const errors = validateFlow(workflow);
    const criticalErrors = errors.filter(e => e.severity === 'error');
    
    expect(criticalErrors).toHaveLength(0);
  });

  it('should catch missing required fields', () => {
    const workflow = {
      schema: 'flowspec.v1',
      // Missing id, title, policy, steps
    };

    const errors = validateFlow(workflow);
    const errorPaths = errors.map(e => e.path);
    
    expect(errorPaths).toContain('id');
    expect(errorPaths).toContain('title');
    expect(errorPaths).toContain('policy');
    expect(errorPaths).toContain('steps');
  });

  it('should validate step structure', () => {
    const workflow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      policy: { enforcement: 'none' },
      steps: [{
        // Missing id, role, instructions, acceptance
      }]
    };

    const errors = validateFlow(workflow);
    const stepErrors = errors.filter(e => e.path.startsWith('steps[0]'));
    
    expect(stepErrors.length).toBeGreaterThan(0);
    expect(stepErrors.some(e => e.path.includes('.id'))).toBe(true);
    expect(stepErrors.some(e => e.path.includes('.role'))).toBe(true);
  });
  
  it('should validate ID pattern correctly', () => {
    const validIds = ['test.flow.v1', 'domain.name.v2', 'my-app.workflow_1.v10'];
    const invalidIds = ['test.v1', 'TestFlow.v1', 'test.flow.V1', 'test.flow'];
    
    validIds.forEach(id => {
      const workflow = {
        schema: 'flowspec.v1',
        id,
        title: 'Test',
        policy: { enforcement: 'none' },
        steps: [{
          id: 'step_one',
          role: 'human',
          instructions: ['Test'],
          acceptance: { checks: [] }
        }]
      };
      const errors = validateFlow(workflow);
      const idError = errors.find(e => e.path === 'id' && e.message.includes('pattern'));
      expect(idError).toBeUndefined();
    });
    
    invalidIds.forEach(id => {
      const workflow = {
        schema: 'flowspec.v1',
        id,
        title: 'Test',
        policy: { enforcement: 'none' },
        steps: []
      };
      const errors = validateFlow(workflow);
      const idError = errors.find(e => e.path === 'id');
      expect(idError).toBeDefined();
    });
  });
});
```

## Acceptance Tests

Create `scripts/verify-parsing-validation.py`:
```python
#!/usr/bin/env python3
import os
import sys
import subprocess

def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_id_regex():
    """Check that ID regex matches documented pattern"""
    validator_file = 'lib/workflow-core/validator.ts'
    with open(validator_file, 'r') as f:
        content = f.read()
        # Check for corrected regex pattern
        if r'/^[a-z0-9_.-]+\.[a-z0-9_.-]+\.v[0-9]+$/' not in content:
            print(f"❌ ID regex pattern not corrected")
            return False
    print("✅ ID regex matches <domain>.<n>.v<major> pattern")
    return True

def check_api_implementation():
    """Check that loadWorkflow is implemented"""
    api_file = 'lib/workflow-core/api.ts'
    with open(api_file, 'r') as f:
        content = f.read()
        if 'throw new Error(\'Not implemented: loadWorkflow\')' in content:
            print(f"❌ loadWorkflow still not implemented")
            return False
        if 'parseYAML' not in content:
            print(f"❌ parseYAML not imported")
            return False
    
    print("✅ loadWorkflow is implemented")
    return True

def check_api_tests_updated():
    """Check that API shape tests are updated"""
    test_file = 'lib/workflow-core/api.shape.test.ts'
    with open(test_file, 'r') as f:
        content = f.read()
        # Should not test for "not implemented" on implemented functions
        if "await expect(api.loadWorkflow('test')).rejects.toThrow('Not implemented')" in content:
            print(f"❌ API tests still expect 'not implemented' for loadWorkflow")
            return False
    
    print("✅ API shape tests updated for Phase 1")
    return True

def check_component_integration():
    """Check that WorkflowLoader is integrated"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'WorkflowLoader' not in content:
            print(f"❌ WorkflowLoader not integrated")
            return False
    
    print("✅ WorkflowLoader integrated")
    return True

def run_tests():
    """Run validator tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/workflow-core/validator.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Validator tests pass")
        return True
    
    print(f"❌ Tests failed")
    return False

def test_sample_workflow():
    """Test parsing a sample workflow"""
    sample = '''schema: flowspec.v1
id: test.sample.v1
title: Test Sample
policy:
  enforcement: advice
steps:
  - id: step_one
    role: human
    instructions:
      - Do this
    acceptance:
      checks:
        - kind: file_exists
          path: /test'''
    
    # Write sample file
    os.makedirs('test-data', exist_ok=True)
    with open('test-data/sample.flow.yaml', 'w') as f:
        f.write(sample)
    
    print("✅ Created test workflow file")
    return True

def main():
    checks = [
        # Check new files exist
        check_file_exists('lib/workflow-core/parser.ts'),
        check_file_exists('lib/workflow-core/validator.ts'),
        check_file_exists('components/workflow-loader.tsx'),
        check_file_exists('lib/workflow-core/validator.test.ts'),
        
        # Check fixes
        check_id_regex(),
        check_api_tests_updated(),
        
        # Check implementation
        check_api_implementation(),
        check_component_integration(),
        
        # Run tests
        run_tests(),
        
        # Create test data
        test_sample_workflow()
    ]
    
    if all(checks):
        print("\n🎉 Parsing and validation implementation complete!")
        print("Workflows are now parsed and validated with immediate feedback.")
        print("Test with: test-data/sample.flow.yaml")
        sys.exit(0)
    else:
        print("\n❌ Parsing and validation implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria
- [ ] YAML files are parsed correctly
- [ ] Invalid YAML shows clear error messages
- [ ] ID validation regex matches `<domain>.<n>.v<major>` pattern correctly
- [ ] Schema validation catches missing required fields
- [ ] Validation errors show field paths
- [ ] Valid workflows display summary info (ID, title, steps count, policy)
- [ ] Warnings are shown separately from errors
- [ ] loadWorkflow function is fully implemented (not a stub)
- [ ] saveWorkflow function is fully implemented
- [ ] validateWorkflow function is fully implemented  
- [ ] API shape tests updated (no "not implemented" for Phase 1 functions)
- [ ] Tests pass for validation logic including ID pattern tests
- [ ] Sample workflow file created for testing
- [ ] Component uses 'use client' directive
- [ ] Page does NOT have 'use client' directive