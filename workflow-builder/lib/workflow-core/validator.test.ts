import { describe, it, expect } from 'vitest';
import { validateFlow } from './validator';

describe('Workflow Validator', () => {
  it('should validate a minimal valid workflow', () => {
    const workflow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test Flow',
      owner: 'test@example.com',  // Add missing required field
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
      // Missing id, title, owner, steps (policy is optional)
    };

    const errors = validateFlow(workflow);
    const errorPaths = errors.map(e => e.path);
    
    expect(errorPaths).toContain('id');
    expect(errorPaths).toContain('title');
    expect(errorPaths).toContain('owner');
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
