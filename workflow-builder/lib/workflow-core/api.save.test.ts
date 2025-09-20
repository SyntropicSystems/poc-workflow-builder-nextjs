import { describe, it, expect } from 'vitest';
import { saveWorkflow } from './api';
import type { Flow } from './generated';
import * as yaml from 'js-yaml';

describe('saveWorkflow', () => {
  const validWorkflow: Flow = {
    schema: 'flowspec.v1',
    id: 'test.workflow.v1',
    title: 'Test Workflow',
    owner: 'test@example.com',
    steps: [
      {
        id: 'step1',
        title: 'First Step',
        role: 'human',
        instructions: ['Do something'],
        acceptance: { 
          checks: [{ kind: 'manual', expr: 'completed' }]
        }
      }
    ]
  };

  it('should serialize a valid workflow to YAML', async () => {
    const result = await saveWorkflow(validWorkflow);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      
      // Parse the YAML back to verify it's valid
      const parsed = yaml.load(result.data) as Flow;
      expect(parsed.id).toBe(validWorkflow.id);
      expect(parsed.steps).toHaveLength(1);
    }
  });

  it('should preserve all workflow properties', async () => {
    const workflowWithPolicy: Flow = {
      ...validWorkflow,
      policy: {
        enforcement: 'guard'
      }
    };
    
    const result = await saveWorkflow(workflowWithPolicy);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const parsed = yaml.load(result.data) as Flow;
      expect(parsed.policy?.enforcement).toBe('guard');
    }
  });

  it('should format YAML with proper indentation', async () => {
    const result = await saveWorkflow(validWorkflow);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const lines = result.data.split('\n');
      expect(lines[0]).toBe('schema: flowspec.v1');
      expect(lines.some((line: string) => line.startsWith('  '))).toBe(true); // Has indentation
    }
  });

  it('should preserve key order', async () => {
    const result = await saveWorkflow(validWorkflow);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const lines = result.data.split('\n');
      const schemaIndex = lines.findIndex((line: string) => line.startsWith('schema:'));
      const idIndex = lines.findIndex((line: string) => line.startsWith('id:'));
      const titleIndex = lines.findIndex((line: string) => line.startsWith('title:'));
      
      expect(schemaIndex).toBeLessThan(idIndex);
      expect(idIndex).toBeLessThan(titleIndex);
    }
  });

  it('should handle empty workflow steps', async () => {
    const emptyWorkflow: Flow = {
      ...validWorkflow,
      steps: []
    };
    
    const result = await saveWorkflow(emptyWorkflow);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const parsed = yaml.load(result.data) as Flow;
      expect(parsed.steps).toEqual([]);
    }
  });

  it('should handle complex nested structures', async () => {
    const complexWorkflow: Flow = {
      ...validWorkflow,
      steps: [
        {
          id: 'complex_step',
          title: 'Complex Step',
          role: 'ai',
          instructions: ['First instruction', 'Second instruction'],
          acceptance: { 
            checks: [
              { kind: 'file_exists', path: '/test' },
              { kind: 'command', expr: 'echo "test"' }
            ]
          },
          next: [
            { to: 'next_step', when: 'success' },
            { to: 'error_step', when: 'failure' }
          ],
          token: {
            scope: {}
          }
        }
      ]
    };
    
    const result = await saveWorkflow(complexWorkflow);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const parsed = yaml.load(result.data) as Flow;
      expect(parsed.steps![0].instructions).toHaveLength(2);
      expect(parsed.steps![0].acceptance?.checks).toHaveLength(2);
      expect(parsed.steps![0].next).toHaveLength(2);
    }
  });

  it('should clean up undefined values', async () => {
    const workflowWithUndefined: Flow = {
      ...validWorkflow,
      steps: [
        {
          id: 'step1',
          title: 'Test',
          role: 'human',
          instructions: ['Do something'],
          acceptance: { checks: [] },
          desc: undefined as any
        }
      ]
    };
    
    const result = await saveWorkflow(workflowWithUndefined);
    expect(result.success).toBe(true);
    
    if (result.success) {
      // Undefined values should not appear in YAML
      expect(result.data).not.toContain('desc:');
    }
  });
});
