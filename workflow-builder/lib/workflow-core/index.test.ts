import { describe, it, expect } from 'vitest'
import * as workflowCore from './index'

describe('Workflow Core Module', () => {
  it('should export all API functions', () => {
    const expectedExports = [
      'loadWorkflow',
      'saveWorkflow',
      'validateWorkflow',
      'updateStep',
      'addStep',
      'removeStep',
      'createWorkflowFromTemplate'
    ]
    
    for (const exportName of expectedExports) {
      expect(workflowCore).toHaveProperty(exportName)
      expect(typeof (workflowCore as any)[exportName]).toBe('function')
    }
  })
})
