import { describe, it, expect } from 'vitest';
import { addStep, removeStep, duplicateStep } from './api';
import type { Flow, Step } from './generated';

describe('Step Management', () => {
  // Using any type to avoid schema conflicts in tests
  const baseWorkflow: any = {
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
          checks: [{ description: 'It is done' }]
        },
        next: [{ to: 'step2', when: 'done' }]
      },
      {
        id: 'step2',
        role: 'ai',
        instructions: ['Process'],
        acceptance: {
          checks: [{ description: 'Processed' }]
        }
      }
    ]
  };

  describe('addStep', () => {
    it('should add a new step to workflow', () => {
      const newStep: Step = {
        id: 'step3',
        role: 'system',
        instructions: ['Check'],
        acceptance: {
          checks: [{ description: 'Checked' }]
        }
      } as Step;
      
      const result = addStep(baseWorkflow, newStep);
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(3);
      expect(result.data?.steps?.[2].id).toBe('step3');
    });

    it('should insert step at specific position', () => {
      const newStep: Step = {
        id: 'step_middle',
        role: 'human',
        instructions: ['Review'],
        acceptance: {
          checks: [{ description: 'Reviewed' }]
        }
      } as Step;
      
      const result = addStep(baseWorkflow, newStep, 1);
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[1].id).toBe('step_middle');
      expect(result.data?.steps).toHaveLength(3);
    });

    it('should reject duplicate step IDs', () => {
      const duplicateStep: Step = {
        id: 'step1',
        role: 'human',
        instructions: ['Duplicate'],
        acceptance: {
          checks: [{ description: 'Duplicate' }]
        }
      } as Step;
      
      const result = addStep(baseWorkflow, duplicateStep);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already exists');
    });

    it('should validate step ID format', () => {
      const invalidStep: Step = {
        id: 'Step-1', // Invalid: uppercase and hyphen
        role: 'human',
        instructions: ['Test'],
        acceptance: {
          checks: [{ description: 'Test' }]
        }
      } as Step;
      
      const result = addStep(baseWorkflow, invalidStep);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('lowercase with underscores');
    });

    it('should reject steps missing required fields', () => {
      const incompleteStep = {
        id: 'incomplete_step',
        role: 'human'
        // Missing instructions and acceptance
      } as Step;
      
      const result = addStep(baseWorkflow, incompleteStep);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('missing required fields');
    });

    it('should handle workflow without existing steps', () => {
      const emptyWorkflow: Flow = {
        ...baseWorkflow,
        steps: []
      };

      const newStep: Step = {
        id: 'first_step',
        role: 'human',
        instructions: ['Start'],
        acceptance: {
          checks: [{ description: 'Started' }]
        }
      } as Step;
      
      const result = addStep(emptyWorkflow, newStep);
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(1);
      expect(result.data?.steps?.[0].id).toBe('first_step');
    });
  });

  describe('removeStep', () => {
    it('should remove step by ID', () => {
      const result = removeStep(baseWorkflow, 'step2');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(1);
      expect(result.data?.steps?.[0].id).toBe('step1');
    });

    it('should clean up references to removed step', () => {
      const result = removeStep(baseWorkflow, 'step2');
      
      expect(result.success).toBe(true);
      // step1's next should no longer reference step2
      expect(result.data?.steps?.[0].next).toHaveLength(0);
    });

    it('should handle non-existent step ID', () => {
      const result = removeStep(baseWorkflow, 'nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found');
    });

    it('should handle workflow without steps', () => {
      const emptyWorkflow: Flow = {
        ...baseWorkflow,
        steps: []
      };
      
      const result = removeStep(emptyWorkflow, 'step1');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('no steps');
    });

    it('should preserve workflow integrity when removing steps', () => {
      const complexWorkflow: Flow = {
        ...baseWorkflow,
        steps: [
          {
            id: 'step1',
            role: 'human',
            instructions: ['Start'],
            acceptance: { checks: [{ description: 'Started' }] },
            next: [{ to: 'step2', when: 'ready' }, { to: 'step3', when: 'skip' }]
          },
          {
            id: 'step2',
            role: 'ai',
            instructions: ['Process'],
            acceptance: { checks: [{ description: 'Processed' }] },
            next: [{ to: 'step3', when: 'done' }]
          },
          {
            id: 'step3',
            role: 'system',
            instructions: ['Finalize'],
            acceptance: { checks: [{ description: 'Finalized' }] }
          }
        ]
      } as Flow;

      const result = removeStep(complexWorkflow, 'step2');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(2);
      
      // Check that step1 still has reference to step3 but not step2
      const step1 = result.data?.steps?.find(s => s.id === 'step1');
      expect(step1?.next).toHaveLength(1);
      expect(step1?.next?.[0].to).toBe('step3');
    });
  });

  describe('duplicateStep', () => {
    it('should duplicate a step with new ID', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'step1_copy');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps).toHaveLength(3);
      expect(result.data?.steps?.find(s => s.id === 'step1_copy')).toBeDefined();
    });

    it('should add (Copy) to title', () => {
      const workflowWithTitles: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            title: 'First Step'
          },
          baseWorkflow.steps![1]
        ]
      };

      const result = duplicateStep(workflowWithTitles, 'step1', 'step1_copy');
      
      const copiedStep = result.data?.steps?.find(s => s.id === 'step1_copy');
      expect(copiedStep?.title).toBe('First Step (Copy)');
    });

    it('should use ID as title fallback and add (Copy)', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'step1_copy');
      
      const copiedStep = result.data?.steps?.find(s => s.id === 'step1_copy');
      expect(copiedStep?.title).toBe('step1 (Copy)');
    });

    it('should remove next conditions from duplicate', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'step1_copy');
      
      const copiedStep = result.data?.steps?.find(s => s.id === 'step1_copy');
      expect(copiedStep?.next).toBeUndefined();
    });

    it('should handle non-existent step ID', () => {
      const result = duplicateStep(baseWorkflow, 'nonexistent', 'new_copy');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found');
    });

    it('should validate new ID format', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'Invalid-ID');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('lowercase with underscores');
    });

    it('should reject duplicate new ID', () => {
      const result = duplicateStep(baseWorkflow, 'step1', 'step2');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already exists');
    });

    it('should preserve all properties except ID, title, and next', () => {
      const complexStep = {
        id: 'complex_step',
        title: 'Complex Step',
        role: 'ai',
        instructions: ['Do complex things', 'More instructions'],
        acceptance: {
          checks: [
            { description: 'First check' },
            { description: 'Second check' }
          ]
        },
        token: {
          scope: {
            repositories: 'write'
          }
        },
        next: [{ to: 'step2', when: 'done' }],
        timeoutMs: 5000,
        maxAttempts: 3
      } as Step;

      const workflowWithComplexStep: Flow = {
        ...baseWorkflow,
        steps: [complexStep, ...baseWorkflow.steps!]
      };

      const result = duplicateStep(workflowWithComplexStep, 'complex_step', 'complex_copy');
      
      expect(result.success).toBe(true);
      
      const copiedStep = result.data?.steps?.find(s => s.id === 'complex_copy');
      expect(copiedStep?.role).toBe('ai');
      expect(copiedStep?.instructions).toEqual(['Do complex things', 'More instructions']);
      expect(copiedStep?.acceptance).toEqual(complexStep.acceptance);
      expect(copiedStep?.token).toEqual(complexStep.token);
      expect(copiedStep?.timeoutMs).toBe(5000);
      expect(copiedStep?.maxAttempts).toBe(3);
      expect(copiedStep?.next).toBeUndefined(); // Should be removed
    });
  });
});
