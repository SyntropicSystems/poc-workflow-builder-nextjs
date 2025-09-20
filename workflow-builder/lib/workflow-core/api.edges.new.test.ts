import { describe, it, expect } from 'vitest';
import {
  addEdge,
  removeEdge,
  updateEdge
} from './api';
import type { Flow } from './generated';

describe('Edge Management API', () => {
  // Function to create fresh test data for each test
  const createBaseWorkflow = (): Flow => ({
    schema: 'flowspec.v1',
    id: 'test.v1',
    title: 'Test',
    owner: 'test@example.com',
    steps: [
      {
        id: 'step1',
        role: 'human',
        instructions: ['Do A'],
        acceptance: {
          checks: [{ kind: 'manual', expr: 'done' }]
        }
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
  });
  
  describe('addEdge', () => {
    it('should add edge successfully', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'success');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toHaveLength(1);
        expect(step1?.next?.[0].to).toBe('step2');
        expect(step1?.next?.[0].when).toBe('success');
      }
    });
    
    it('should add edge to step without existing next array', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = addEdge(baseWorkflow, 'step2', 'step3', 'completed');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step2 = result.data.steps?.find(s => s.id === 'step2');
        expect(step2?.next).toHaveLength(1);
        expect(step2?.next?.[0].to).toBe('step3');
        expect(step2?.next?.[0].when).toBe('completed');
      }
    });

    it('should add multiple edges to same step', () => {
      let workflow = createBaseWorkflow();
      
      // Add first edge
      const result1 = addEdge(workflow, 'step1', 'step2', 'success');
      expect(result1.success).toBe(true);
      
      if (result1.success) {
        workflow = result1.data;
        
        // Add second edge
        const result2 = addEdge(workflow, 'step1', 'step3', 'failure');
        expect(result2.success).toBe(true);
        
        if (result2.success) {
          const step1 = result2.data.steps?.find(s => s.id === 'step1');
          expect(step1?.next).toHaveLength(2);
          expect(step1?.next?.some(n => n.to === 'step2' && n.when === 'success')).toBe(true);
          expect(step1?.next?.some(n => n.to === 'step3' && n.when === 'failure')).toBe(true);
        }
      }
    });
    
    it('should validate condition format', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = addEdge(baseWorkflow, 'step1', 'step2', 'Invalid-Condition');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('lowercase with underscores');
      }
    });
    
    it('should prevent duplicate conditions', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdge = { ...baseWorkflow };
      workflowWithEdge.steps![0].next = [{ to: 'step2', when: 'success' }];
      
      const result = addEdge(workflowWithEdge, 'step1', 'step3', 'success');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('already exists');
      }
    });
    
    it('should validate source step exists', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = addEdge(baseWorkflow, 'non_existent', 'step2', 'success');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Source step "non_existent" not found');
      }
    });

    it('should validate target step exists', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = addEdge(baseWorkflow, 'step1', 'non_existent', 'success');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Target step "non_existent" not found');
      }
    });
    
    it('should detect circular dependencies', () => {
      // Create a chain: step1 -> step2 -> step3
      let workflow = createBaseWorkflow();
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      workflow.steps![1].next = [{ to: 'step3', when: 'success' }];
      
      // Try to create cycle: step3 -> step1
      const result = addEdge(workflow, 'step3', 'step1', 'loop');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('circular dependency');
      }
    });

    it('should allow self-referencing edges', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = addEdge(baseWorkflow, 'step1', 'step1', 'retry');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toHaveLength(1);
        expect(step1?.next?.[0].to).toBe('step1');
        expect(step1?.next?.[0].when).toBe('retry');
      }
    });

  });
  
  describe('removeEdge', () => {
    it('should remove edge successfully', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = removeEdge(workflowWithEdges, 'step1', 0);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toHaveLength(1);
        expect(step1?.next?.[0].to).toBe('step3');
        expect(step1?.next?.[0].when).toBe('failure');
      }
    });
    
    it('should remove next array if no edges remain', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithOneEdge: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [{ to: 'step2', when: 'success' }]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = removeEdge(workflowWithOneEdge, 'step1', 0);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toBeUndefined();
      }
    });

    it('should handle step without edges', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = removeEdge(baseWorkflow, 'step1', 0);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('has no edges');
      }
    });

    it('should handle non-existent step', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = removeEdge(baseWorkflow, 'non_existent', 0);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should handle edge index out of bounds', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = removeEdge(workflowWithEdges, 'step1', 5);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('out of bounds');
      }
    });

    it('should handle negative edge index', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = removeEdge(workflowWithEdges, 'step1', -1);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('out of bounds');
      }
    });

    it('should remove correct edge by index', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = removeEdge(workflowWithEdges, 'step1', 1); // Remove 'failure' edge
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toHaveLength(1);
        expect(step1?.next?.[0].to).toBe('step2');
        expect(step1?.next?.[0].when).toBe('success');
      }
    });
  });
  
  describe('updateEdge', () => {
    it('should update edge condition', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 0, 'approved');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next).toHaveLength(2);
        expect(step1?.next?.[0].to).toBe('step2');
        expect(step1?.next?.[0].when).toBe('approved');
        expect(step1?.next?.[1].to).toBe('step3');
        expect(step1?.next?.[1].when).toBe('failure');
      }
    });
    
    it('should update edge target', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 0, 'success', 'step3');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.[0].to).toBe('step3');
        expect(step1?.next?.[0].when).toBe('success');
      }
    });

    it('should update both condition and target', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 1, 'rejected', 'step2');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.[1].to).toBe('step2');
        expect(step1?.next?.[1].when).toBe('rejected');
      }
    });

    it('should handle non-existent step', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'non_existent', 0, 'new_condition');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('not found');
      }
    });

    it('should handle step without edges', () => {
      const baseWorkflow = createBaseWorkflow();
      const result = updateEdge(baseWorkflow, 'step1', 0, 'new_condition');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('has no edges');
      }
    });

    it('should handle edge index out of bounds', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 5, 'new_condition');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('out of bounds');
      }
    });

    it('should validate new condition format', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 0, 'Invalid-Condition');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('lowercase with underscores');
      }
    });

    it('should prevent condition conflicts', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 0, 'failure'); // Already exists at index 1
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('already exists');
      }
    });

    it('should validate new target step exists', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 0, 'success', 'non_existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Target step "non_existent" not found');
      }
    });

    it('should detect circular dependencies with new target', () => {
      // Create a longer chain: step1 -> step2 -> step3
      let workflow = createBaseWorkflow();
      workflow.steps![0].next = [{ to: 'step2', when: 'success' }];
      workflow.steps![1].next = [{ to: 'step3', when: 'success' }];
      
      // Try to update step3's edge to point back to step1 (circular)
      workflow.steps![2].next = [{ to: 'step2', when: 'temp' }]; // Add temp edge to update
      
      const result = updateEdge(workflow, 'step3', 0, 'loop', 'step1');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('circular dependency');
      }
    });

    it('should allow same condition if not changing it', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 0, 'success', 'step3');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.[0].when).toBe('success');
        expect(step1?.next?.[0].to).toBe('step3');
      }
    });

    it('should handle updating to same target', () => {
      const baseWorkflow = createBaseWorkflow();
      const workflowWithEdges: Flow = {
        ...baseWorkflow,
        steps: [
          {
            ...baseWorkflow.steps![0],
            next: [
              { to: 'step2', when: 'success' },
              { to: 'step3', when: 'failure' }
            ]
          },
          ...baseWorkflow.steps!.slice(1)
        ]
      };
      
      const result = updateEdge(workflowWithEdges, 'step1', 0, 'completed', 'step2');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const step1 = result.data.steps?.find(s => s.id === 'step1');
        expect(step1?.next?.[0].when).toBe('completed');
        expect(step1?.next?.[0].to).toBe('step2');
      }
    });
  });
});
