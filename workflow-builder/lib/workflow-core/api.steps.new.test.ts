import { describe, it, expect } from 'vitest';
import {
  addStep,
  removeStep,
  updateStep,
  duplicateStep
} from './api';
import type { Flow, Step } from './generated';

describe('Step Management API', () => {
  const baseWorkflow: Flow = {
    schema: 'flowspec.v1',
    id: 'test.v1',
    title: 'Test',
    owner: 'test@example.com',
    steps: [
      {
        id: 'existing_step',
        role: 'human',
        instructions: ['Do something'],
        acceptance: {
          checks: [{ kind: 'manual', expr: 'done' }]
        }
      }
    ]
  };
  
  const newStep: Step = {
    id: 'new_step',
    role: 'ai',
    instructions: ['Process data'],
    acceptance: {
      checks: [{ kind: 'manual', expr: 'processed' }]
    }
  };
  
  describe('addStep', () => {
    it('should add step successfully', () => {
      const result = addStep(baseWorkflow, newStep);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(2);
        expect(result.data.steps?.[1].id).toBe('new_step');
        expect(result.data.steps?.[1].role).toBe('ai');
      }
    });
    
    it('should add step at specific position', () => {
      const result = addStep(baseWorkflow, newStep, 0);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps?.[0].id).toBe('new_step');
        expect(result.data.steps?.[1].id).toBe('existing_step');
        expect(result.data.steps).toHaveLength(2);
      }
    });
    
    it('should add step to empty workflow', () => {
      const emptyWorkflow = { ...baseWorkflow, steps: [] };
      const result = addStep(emptyWorkflow, newStep);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(1);
        expect(result.data.steps?.[0].id).toBe('new_step');
      }
    });
    
    it('should reject duplicate ID', () => {
      const duplicate = { ...newStep, id: 'existing_step' };
      const result = addStep(baseWorkflow, duplicate);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('already exists');
      }
    });
    
    it('should validate required fields', () => {
      const invalidStep: any = { id: 'test' };  // Missing required fields
      const result = addStep(baseWorkflow, invalidStep);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('required fields');
      }
    });
    
    it('should validate ID format', () => {
      const invalidIdStep = { 
        ...newStep, 
        id: 'Invalid-ID' // Should be lowercase with underscores
      };
      const result = addStep(baseWorkflow, invalidIdStep);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('lowercase with underscores');
      }
    });

    it('should handle workflows without steps array', () => {
      const workflowNoSteps = { ...baseWorkflow };
      delete workflowNoSteps.steps;
      
      const result = addStep(workflowNoSteps, newStep);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(1);
        expect(result.data.steps?.[0].id).toBe('new_step');
      }
    });
  });
  
  describe('removeStep', () => {
    it('should remove step successfully', () => {
      const result = removeStep(baseWorkflow, 'existing_step');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(0);
      }
    });
    
    it('should handle non-existent step', () => {
      const result = removeStep(baseWorkflow, 'non_existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should handle workflow with no steps', () => {
      const emptyWorkflow = { ...baseWorkflow, steps: [] };
      const result = removeStep(emptyWorkflow, 'any_step');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('no steps');
      }
    });

    it('should handle workflow without steps array', () => {
      const noStepsWorkflow = { ...baseWorkflow };
      delete noStepsWorkflow.steps;
      
      const result = removeStep(noStepsWorkflow, 'any_step');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('no steps');
      }
    });
    
    it('should clean up references to removed step', () => {
      const workflowWithRefs: Flow = {
        ...baseWorkflow,
        steps: [
          {
            id: 'step1',
            role: 'human',
            instructions: ['Do A'],
            acceptance: {
              checks: [{ kind: 'manual', expr: 'done' }]
            },
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          {
            id: 'step2',
            role: 'ai',
            instructions: ['Process'],
            acceptance: {
              checks: [{ kind: 'manual', expr: 'processed' }]
            }
          },
          {
            id: 'step3',
            role: 'human',
            instructions: ['Review'],
            acceptance: {
              checks: [{ kind: 'manual', expr: 'reviewed' }]
            }
          }
        ]
      };
      
      const result = removeStep(workflowWithRefs, 'step2');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(2);
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toHaveLength(1);
        expect(step1?.next?.[0].to).toBe('step3');
        expect(step1?.next?.[0].when).toBe('failure');
      }
    });

    it('should remove step from middle of array', () => {
      const threeStepWorkflow: Flow = {
        ...baseWorkflow,
        steps: [
          { id: 'step1', role: 'human', instructions: ['A'], acceptance: { checks: [{ kind: 'manual', expr: 'a' }] } },
          { id: 'step2', role: 'ai', instructions: ['B'], acceptance: { checks: [{ kind: 'manual', expr: 'b' }] } },
          { id: 'step3', role: 'human', instructions: ['C'], acceptance: { checks: [{ kind: 'manual', expr: 'c' }] } }
        ]
      };
      
      const result = removeStep(threeStepWorkflow, 'step2');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(2);
        expect(result.data.steps?.[0].id).toBe('step1');
        expect(result.data.steps?.[1].id).toBe('step3');
      }
    });
  });
  
  describe('updateStep', () => {
    it('should update step properties', () => {
      const result = updateStep(baseWorkflow, 'existing_step', {
        title: 'Updated Title',
        role: 'ai'
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step = result.data.steps?.[0];
        expect(step?.title).toBe('Updated Title');
        expect(step?.role).toBe('ai');
        expect(step?.id).toBe('existing_step');  // ID unchanged
        expect(step?.instructions).toEqual(['Do something']); // Original preserved
      }
    });
    
    it('should handle non-existent step', () => {
      const result = updateStep(baseWorkflow, 'non_existent', {
        title: 'New'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });
    
    it('should prevent ID changes', () => {
      const result = updateStep(baseWorkflow, 'existing_step', {
        id: 'new_id'  // Should be ignored
      } as any);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps?.[0].id).toBe('existing_step');
      }
    });

    it('should update complex properties', () => {
      const result = updateStep(baseWorkflow, 'existing_step', {
        instructions: ['New instruction 1', 'New instruction 2'],
        acceptance: {
          checks: [
            { kind: 'manual', expr: 'new_check_1' },
            { kind: 'manual', expr: 'new_check_2' }
          ]
        },
        next: [
          { to: 'next_step', when: 'completed' }
        ]
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step = result.data.steps?.[0];
        expect(step?.instructions).toHaveLength(2);
        expect(step?.acceptance?.checks).toHaveLength(2);
        expect(step?.next).toHaveLength(1);
        expect(step?.next?.[0].to).toBe('next_step');
      }
    });

    it('should handle workflow without steps', () => {
      const emptyWorkflow = { ...baseWorkflow, steps: [] };
      const result = updateStep(emptyWorkflow, 'any_step', { title: 'Test' });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });
  });
  
  describe('duplicateStep', () => {
    it('should duplicate step with new ID', () => {
      const result = duplicateStep(baseWorkflow, 'existing_step', 'copy_step');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(2);
        expect(result.data.steps?.[1].id).toBe('copy_step');
        expect(result.data.steps?.[1].role).toBe('human');
        expect(result.data.steps?.[1].instructions).toEqual(['Do something']);
      }
    });
    
    it('should add (Copy) to title', () => {
      const workflowWithTitle: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            title: 'Original Step'
          }
        ]
      };
      
      const result = duplicateStep(workflowWithTitle, 'existing_step', 'copy');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps?.[1].title).toBe('Original Step (Copy)');
      }
    });

    it('should generate title from ID if no title exists', () => {
      const result = duplicateStep(baseWorkflow, 'existing_step', 'copy');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps?.[1].title).toBe('existing_step (Copy)');
      }
    });
    
    it('should not duplicate next conditions', () => {
      const workflowWithNext: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'other_step', when: 'success' }
            ]
          }
        ]
      };
      
      const result = duplicateStep(workflowWithNext, 'existing_step', 'copy');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const copy = result.data.steps?.[1];
        expect(copy?.next).toBeUndefined();
      }
    });

    it('should handle non-existent step', () => {
      const result = duplicateStep(baseWorkflow, 'non_existent', 'copy');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should validate new ID format', () => {
      const result = duplicateStep(baseWorkflow, 'existing_step', 'Invalid-ID');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('lowercase with underscores');
      }
    });

    it('should prevent duplicate new ID', () => {
      const result = duplicateStep(baseWorkflow, 'existing_step', 'existing_step');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('already exists');
      }
    });

    it('should place duplicate after original', () => {
      const threeStepWorkflow: Flow = {
        ...baseWorkflow,
        steps: [
          { id: 'step1', role: 'human', instructions: ['A'], acceptance: { checks: [{ kind: 'manual', expr: 'a' }] } },
          { id: 'step2', role: 'ai', instructions: ['B'], acceptance: { checks: [{ kind: 'manual', expr: 'b' }] } },
          { id: 'step3', role: 'human', instructions: ['C'], acceptance: { checks: [{ kind: 'manual', expr: 'c' }] } }
        ]
      };
      
      const result = duplicateStep(threeStepWorkflow, 'step2', 'step2_copy');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps).toHaveLength(4);
        expect(result.data.steps?.[0].id).toBe('step1');
        expect(result.data.steps?.[1].id).toBe('step2');
        expect(result.data.steps?.[2].id).toBe('step2_copy');
        expect(result.data.steps?.[3].id).toBe('step3');
      }
    });
  });
});
