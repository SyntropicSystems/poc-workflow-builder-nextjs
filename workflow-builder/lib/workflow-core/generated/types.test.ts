import { describe, it, expect } from 'vitest'
import type { Flow, Step, Policy } from './index'

describe('Generated Protobuf Types', () => {
  it('should have Flow type with required fields', () => {
    // Note: These are interfaces, not classes, so we create plain objects
    const flow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test Flow',
      owner: 'test@example.com',
      labels: [],
      policy: {
        enforcement: 'advice',
        tokensRequired: false,  // Note: protobuf uses camelCase
        eventsRequired: false
      } as Policy,
      context: undefined,
      parameters: {},
      roles: [],
      artifacts: undefined,
      events: undefined,
      steps: []
    }
    
    expect(flow.schema).toBe('flowspec.v1')
    expect(flow.steps).toEqual([])
  })
  
  it('should have Step type with instructions array', () => {
    const step: Partial<Step> = {
      id: 'test_step',
      title: 'Test Step',
      instructions: ['Do this', 'Then that'],
      role: 'human_ai'
    }
    
    expect(step.instructions).toHaveLength(2)
  })
})
