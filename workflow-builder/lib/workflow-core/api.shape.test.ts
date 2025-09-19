import { describe, it, expect } from 'vitest'
import * as api from './api'
import type { Flow, Step } from './generated'

describe('Core API Shape', () => {
  it('should export loadWorkflow function', () => {
    expect(typeof api.loadWorkflow).toBe('function')
    expect(api.loadWorkflow.length).toBe(1) // yamlString (options has default value)
  })
  
  it('should export saveWorkflow function', () => {
    expect(typeof api.saveWorkflow).toBe('function')
    expect(api.saveWorkflow.length).toBe(1) // workflow
  })
  
  it('should export validateWorkflow function', () => {
    expect(typeof api.validateWorkflow).toBe('function')
    expect(api.validateWorkflow.length).toBe(1) // workflow (options has default value)
  })
  
  it('should export updateStep function', () => {
    expect(typeof api.updateStep).toBe('function')
    expect(api.updateStep.length).toBe(3) // workflow + stepId + updates
  })
  
  it('should export addStep function', () => {
    expect(typeof api.addStep).toBe('function')
    expect(api.addStep.length).toBe(3) // workflow + step + position
  })
  
  it('should export removeStep function', () => {
    expect(typeof api.removeStep).toBe('function')
    expect(api.removeStep.length).toBe(2) // workflow + stepId
  })
  
  it('should export createWorkflowFromTemplate function', () => {
    expect(typeof api.createWorkflowFromTemplate).toBe('function')
    expect(api.createWorkflowFromTemplate.length).toBe(2) // id + title
  })
  
  it('should throw not implemented errors', async () => {
    await expect(api.loadWorkflow('test')).rejects.toThrow('Not implemented')
    await expect(api.saveWorkflow({} as Flow)).rejects.toThrow('Not implemented')
    await expect(api.validateWorkflow({} as Flow)).rejects.toThrow('Not implemented')
    
    expect(() => api.updateStep({} as Flow, 'id', {})).toThrow('Not implemented')
    expect(() => api.addStep({} as Flow, {} as Step)).toThrow('Not implemented')
    expect(() => api.removeStep({} as Flow, 'id')).toThrow('Not implemented')
    expect(() => api.createWorkflowFromTemplate('id', 'title')).toThrow('Not implemented')
  })
})
