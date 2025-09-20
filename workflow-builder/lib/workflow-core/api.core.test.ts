import { describe, it, expect } from 'vitest';
import {
  loadWorkflow,
  saveWorkflow,
  validateWorkflow,
  createWorkflow,
  createWorkflowFromTemplate
} from './api';
import type { Flow } from './generated';

describe('Core API Functions', () => {
  describe('loadWorkflow', () => {
    it('should load valid YAML successfully', async () => {
      const yaml = `
schema: flowspec.v1
id: test.workflow.v1
title: Test Workflow
owner: test@example.com
steps:
  - id: step1
    role: human
    instructions:
      - Do something
    acceptance:
      checks:
        - description: It is done
`;
      const result = await loadWorkflow(yaml);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test.workflow.v1');
        expect(result.data.schema).toBe('flowspec.v1');
        expect(result.data.steps).toHaveLength(1);
        expect(result.data.steps?.[0].id).toBe('step1');
      }
    });
    
    it('should handle empty YAML', async () => {
      const result = await loadWorkflow('');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Invalid workflow structure');
      }
    });
    
    it('should handle invalid YAML syntax', async () => {
      const yaml = `
schema: flowspec.v1
id: [this is: invalid yaml
`;
      const result = await loadWorkflow(yaml);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBeDefined();
      }
    });
    
    it('should validate required fields', async () => {
      const yaml = `
schema: flowspec.v1
title: Missing ID and Owner
`;
      const result = await loadWorkflow(yaml);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Validation failed');
      }
    });
    
    it('should handle wrong schema version', async () => {
      const yaml = `
schema: flowspec.v2
id: test.v1
title: Test
owner: test@example.com
`;
      const result = await loadWorkflow(yaml);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Invalid workflow structure');
      }
    });

    it('should handle strict mode validation', async () => {
      const yaml = `
schema: flowspec.v1
id: test.v1
title: Test
owner: test@example.com
steps: []
`;
      const result = await loadWorkflow(yaml, { strict: true });
      
      // Should succeed even in strict mode if no warnings
      expect(result.success).toBe(true);
    });
  });
  
  describe('saveWorkflow', () => {
    const validWorkflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.workflow.v1',
      title: 'Test Workflow',
      owner: 'test@example.com',
      steps: [
        {
          id: 'step1',
          role: 'human',
          instructions: ['Do something'],
          acceptance: {
            checks: [{ kind: 'manual', expr: 'completed' }]
          }
        }
      ]
    };
    
    it('should save valid workflow to YAML', async () => {
      const result = await saveWorkflow(validWorkflow);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('schema: flowspec.v1');
        expect(result.data).toContain('id: test.workflow.v1');
        expect(result.data).toContain('step1');
      }
    });
    
    it('should reject invalid workflow', async () => {
      const invalidWorkflow: any = {
        ...validWorkflow,
        id: 'INVALID ID'  // Invalid format
      };
      
      const result = await saveWorkflow(invalidWorkflow);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('invalid workflow');
      }
    });
    
    it('should preserve complex structures', async () => {
      const complexWorkflow: Flow = {
        ...validWorkflow,
        policy: {
          enforcement: 'guard'
        },
        steps: [
          {
            id: 'step1',
            role: 'human',
            title: 'Step One',
            instructions: ['Do A', 'Do B'],
            acceptance: {
              checks: [
                { kind: 'manual', expr: 'task_a_done' },
                { kind: 'manual', expr: 'task_b_done' }
              ]
            },
            next: [
              { to: 'step2', when: 'success' }
            ],
            token: {
              scope: {
                fsRead: ['./input']
              }
            }
          }
        ]
      };
      
      const result = await saveWorkflow(complexWorkflow);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Verify YAML contains the complex structure
        expect(result.data).toContain('enforcement: guard');
        expect(result.data).toContain('to: step2');
        expect(result.data).toContain('fsRead');
      }
    });

    it('should clean undefined values', async () => {
      const workflowWithUndefined = {
        ...validWorkflow,
        description: undefined,  // Should be cleaned
        tags: null  // Should be cleaned
      };
      
      const result = await saveWorkflow(workflowWithUndefined);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toContain('description:');
        expect(result.data).not.toContain('tags:');
      }
    });
  });
  
  describe('validateWorkflow', () => {
    it('should return empty array for valid workflow', async () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'test.workflow.v1',
        title: 'Test',
        owner: 'test@example.com',
        steps: []
      };
      
      const errors = await validateWorkflow(workflow);
      const criticalErrors = errors.filter(e => e.severity === 'error');
      
      expect(criticalErrors).toHaveLength(0);
    });
    
    it('should detect missing required fields', async () => {
      const workflow: any = {
        schema: 'flowspec.v1'
        // Missing id, title, owner
      };
      
      const errors = await validateWorkflow(workflow);
      
      expect(errors.some(e => e.path.includes('id'))).toBe(true);
      expect(errors.some(e => e.path.includes('title'))).toBe(true);
      expect(errors.some(e => e.path.includes('owner'))).toBe(true);
    });
    
    it('should validate ID format', async () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'InvalidID',  // Should be lowercase.with.dots.v1
        title: 'Test',
        owner: 'test@example.com',
        steps: []
      };
      
      const errors = await validateWorkflow(workflow);
      
      expect(errors.some(e => 
        e.path.includes('id') && e.message.toLowerCase().includes('pattern')
      )).toBe(true);
    });
    
    it('should validate email format', async () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'test.v1',
        title: 'Test',
        owner: 'not-an-email',
        steps: []
      };
      
      const errors = await validateWorkflow(workflow);
      
      expect(errors.some(e => 
        e.path.includes('owner') && e.message.toLowerCase().includes('email')
      )).toBe(true);
    });
    
    it('should validate step required fields', async () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'test.v1',
        title: 'Test',
        owner: 'test@example.com',
        steps: [
          {
            id: 'step1',
            role: 'human',
            instructions: [],  // Empty
            acceptance: {
              checks: []  // Empty
            }
          }
        ]
      };
      
      const errors = await validateWorkflow(workflow);
      
      expect(errors.some(e => e.path.includes('instructions'))).toBe(true);
      expect(errors.some(e => e.path.includes('checks'))).toBe(true);
    });

    it('should handle workflow options', async () => {
      const workflow: Flow = {
        schema: 'flowspec.v1',
        id: 'test.v1',
        title: 'Test',
        owner: 'test@example.com',
        steps: []
      };
      
      const errors = await validateWorkflow(workflow, { strict: true });
      
      // Should return an array regardless of options
      expect(Array.isArray(errors)).toBe(true);
    });
  });
  
  describe('createWorkflow', () => {
    it('should create valid workflow', () => {
      const result = createWorkflow(
        'test.workflow.v1',
        'Test Workflow',
        'test@example.com'
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schema).toBe('flowspec.v1');
        expect(result.data.id).toBe('test.workflow.v1');
        expect(result.data.title).toBe('Test Workflow');
        expect(result.data.owner).toBe('test@example.com');
        expect(result.data.steps).toEqual([]);
        expect(result.data.policy?.enforcement).toBe('none');
      }
    });
    
    it('should accept custom policy', () => {
      const result = createWorkflow(
        'test.v1',
        'Test',
        'test@example.com',
        { enforcement: 'guard' }
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.policy?.enforcement).toBe('guard');
      }
    });
    
    it('should validate ID format', () => {
      const result = createWorkflow(
        'INVALID',
        'Test',
        'test@example.com'
      );
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('pattern');
      }
    });
    
    it('should validate email', () => {
      const result = createWorkflow(
        'test.v1',
        'Test',
        'invalid-email'
      );
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('email');
      }
    });

    it('should require all fields', () => {
      const result = createWorkflow(
        '',
        'Test',
        'test@example.com'
      );
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('required fields');
      }
    });
  });

  describe('createWorkflowFromTemplate', () => {
    it('should create workflow from template', () => {
      const result = createWorkflowFromTemplate(
        'template.test.v1',
        'Template Test',
        'template@example.com'
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.schema).toBe('flowspec.v1');
        expect(result.data.id).toBe('template.test.v1');
        expect(result.data.title).toBe('Template Test');
        expect(result.data.owner).toBe('template@example.com');
        expect(result.data.steps).toEqual([]);
        expect(result.data.policy?.enforcement).toBe('none');
      }
    });

    it('should validate ID format', () => {
      const result = createWorkflowFromTemplate(
        'Invalid_ID',
        'Test',
        'test@example.com'
      );
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('pattern');
      }
    });

    it('should validate email format', () => {
      const result = createWorkflowFromTemplate(
        'test.v1',
        'Test',
        'not-valid-email'
      );
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('email');
      }
    });
  });
});
