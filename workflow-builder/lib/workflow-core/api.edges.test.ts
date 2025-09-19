import { describe, it, expect } from 'vitest';
import { addEdge, updateEdge, removeEdge } from './api';
import type { Flow } from './generated';

describe('Edge Management API', () => {
  const baseWorkflow: Flow = {
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
          checks: [
            { description: 'Task completed' }
          ]
        }
      },
      {
        id: 'step2',
        role: 'ai',
        instructions: ['Process'],
        acceptance: {
          checks: [
            { description: 'Processed' }
          ]
        }
      },
      {
        id: 'step3',
        role: 'system',
        instructions: ['Verify'],
        acceptance: {
          checks: [
            { description: 'Verified' }
          ]
        }
      }
    ]
  };

  describe('addEdge', () => {
    it('should add edge between steps', () => {
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'success');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual([{ to: 'step2', when: 'success' }]);
    });

    it('should validate condition format', () => {
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'Success-Case');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('lowercase with underscores');
    });

    it('should prevent duplicate conditions', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      
      const result = addEdge(workflow, 'step1', 'step3', 'success');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already exists');
    });

    it('should detect circular dependencies', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'done' }];
      workflow.steps![1].next = [{ to: 'step3', when: 'done' }];
      
      const result = addEdge(workflow, 'step3', 'step1', 'loop');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('circular dependency');
    });

    it('should reject invalid step IDs', () => {
      const result1 = addEdge(baseWorkflow, 'invalid', 'step2', 'success');
      expect(result1.success).toBe(false);
      expect(result1.error?.message).toContain('Source step "invalid" not found');

      const result2 = addEdge(baseWorkflow, 'step1', 'invalid', 'success');
      expect(result2.success).toBe(false);
      expect(result2.error?.message).toContain('Target step "invalid" not found');
    });

    it('should add multiple edges to same step', () => {
      const result1 = addEdge(baseWorkflow, 'step1', 'step2', 'success');
      expect(result1.success).toBe(true);
      
      const result2 = addEdge(result1.data!, 'step1', 'step3', 'failure');
      expect(result2.success).toBe(true);
      
      expect(result2.data?.steps?.[0].next).toEqual([
        { to: 'step2', when: 'success' },
        { to: 'step3', when: 'failure' }
      ]);
    });
  });

  describe('updateEdge', () => {
    it('should update edge condition', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      
      const result = updateEdge(workflow, 'step1', 0, 'approved');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual([{ to: 'step2', when: 'approved' }]);
    });

    it('should update edge target', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      
      const result = updateEdge(workflow, 'step1', 0, 'success', 'step3');
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual([{ to: 'step3', when: 'success' }]);
    });

    it('should validate edge index bounds', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      
      const result = updateEdge(workflow, 'step1', 5, 'approved');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Edge index 5 out of bounds');
    });

    it('should prevent condition conflicts', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [
        { to: 'step2', when: 'success' },
        { to: 'step3', when: 'failure' }
      ];
      
      const result = updateEdge(workflow, 'step1', 1, 'success');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('already exists');
    });

    it('should detect circular dependencies when changing target', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'done' }];
      workflow.steps![1].next = [{ to: 'step3', when: 'done' }];
      
      const result = updateEdge(workflow, 'step3', 0, 'loop', 'step1');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('circular dependency');
    });
  });

  describe('removeEdge', () => {
    it('should remove edge by index', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [
        { to: 'step2', when: 'success' },
        { to: 'step3', when: 'failure' }
      ];
      
      const result = removeEdge(workflow, 'step1', 0);
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toEqual([{ to: 'step3', when: 'failure' }]);
    });

    it('should remove next array if no edges remain', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      
      const result = removeEdge(workflow, 'step1', 0);
      
      expect(result.success).toBe(true);
      expect(result.data?.steps?.[0].next).toBeUndefined();
    });

    it('should validate edge index bounds', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      
      const result = removeEdge(workflow, 'step1', 5);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Edge index 5 out of bounds');
    });

    it('should handle step with no edges', () => {
      const result = removeEdge(baseWorkflow, 'step1', 0);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('has no edges');
    });
  });

  describe('cycle detection', () => {
    it('should allow non-circular connections', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'done' }];
      
      const result = addEdge(workflow, 'step2', 'step3', 'done');
      
      expect(result.success).toBe(true);
    });

    it('should detect simple cycles', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'done' }];
      
      const result = addEdge(workflow, 'step2', 'step1', 'back');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('circular dependency');
    });

    it('should detect complex cycles', () => {
      const workflow = { ...baseWorkflow };
      workflow.steps![0].next = [{ to: 'step2', when: 'next' }];
      workflow.steps![1].next = [{ to: 'step3', when: 'next' }];
      
      const result = addEdge(workflow, 'step3', 'step1', 'loop');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('circular dependency');
    });
  });
});
