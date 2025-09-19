import { describe, it, expect } from 'vitest';
import { convertFlowToNodes } from './flow-to-nodes';
import type { Flow } from './generated';

describe('Flow to Nodes Converter', () => {
  it('should convert steps to nodes', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        {
          id: 'step_one',
          title: 'First Step',
          role: 'human',
          instructions: ['Do this'],
          acceptance: { checks: [] }
        },
        {
          id: 'step_two',
          title: 'Second Step',
          role: 'ai',
          instructions: ['Do that'],
          acceptance: { checks: [] }
        }
      ]
    } as Flow;

    const { nodes, edges } = convertFlowToNodes(workflow);
    
    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe('step_one');
    expect(nodes[1].id).toBe('step_two');
    
    // Should have implicit edge between sequential steps
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('step_one');
    expect(edges[0].target).toBe('step_two');
  });

  it('should handle explicit next steps', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        {
          id: 'step_one',
          next: [{ to: 'step_three' }]
        },
        { id: 'step_two' },
        { id: 'step_three' }
      ]
    } as Flow;

    const { edges } = convertFlowToNodes(workflow);
    
    const explicitEdge = edges.find(e => e.source === 'step_one');
    expect(explicitEdge?.target).toBe('step_three');
  });

  it('should handle empty workflow', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: []
    } as Flow;

    const { nodes, edges } = convertFlowToNodes(workflow);
    
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it('should calculate node data correctly', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        {
          id: 'step_with_data',
          title: 'Step with Data',
          role: 'ai',
          instructions: ['First', 'Second'],
          acceptance: { checks: [{}, {}, {}] }, // Three empty checks
          token: {} // Token present
        }
      ]
    } as Flow;

    const { nodes } = convertFlowToNodes(workflow);
    
    expect(nodes).toHaveLength(1);
    const nodeData = nodes[0].data;
    expect(nodeData.hasToken).toBe(true);
    expect(nodeData.instructionCount).toBe(2);
    expect(nodeData.checkCount).toBe(3);
  });

  it('should handle steps without ids', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        { title: 'First' },
        { title: 'Second' }
      ]
    } as Flow;

    const { nodes, edges } = convertFlowToNodes(workflow);
    
    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe('step_0');
    expect(nodes[1].id).toBe('step_1');
    
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('step_0');
    expect(edges[0].target).toBe('step_1');
  });

  it('should handle conditional edges with labels', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        {
          id: 'decision',
          next: [
            { to: 'success', when: 'approved' },
            { to: 'failure', when: 'rejected' }
          ]
        },
        { id: 'success' },
        { id: 'failure' }
      ]
    } as Flow;

    const { edges } = convertFlowToNodes(workflow);
    
    // Should have 2 explicit edges from decision + 1 implicit edge from success to failure
    expect(edges).toHaveLength(3);
    
    const approvedEdge = edges.find(e => e.target === 'success' && e.source === 'decision');
    expect(approvedEdge?.label).toBe('approved');
    
    const rejectedEdge = edges.find(e => e.target === 'failure' && e.source === 'decision');
    expect(rejectedEdge?.label).toBe('rejected');
    
    // Should also have implicit edge from success to failure
    const implicitEdge = edges.find(e => e.source === 'success' && e.target === 'failure');
    expect(implicitEdge).toBeDefined();
    expect(implicitEdge?.label).toBeUndefined();
  });

  it('should handle null/undefined next.to values', () => {
    const workflow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test',
      steps: [
        {
          id: 'step_one',
          next: [{ to: null as any }]
        },
        { id: 'step_two' }
      ]
    } as Flow;

    const { edges } = convertFlowToNodes(workflow);
    
    // Should not create edge for null target
    const explicitEdges = edges.filter(e => e.source === 'step_one');
    expect(explicitEdges).toHaveLength(0);
  });
});
