import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowHistoryManager, describeAction } from './history-manager';
import type { Flow } from './generated';

describe('WorkflowHistoryManager', () => {
  let manager: WorkflowHistoryManager;
  
  const createWorkflow = (id: string): Flow => ({
    schema: 'flowspec.v1',
    id,
    title: `Workflow ${id}`,
    owner: 'test@example.com',
    steps: []
  });
  
  beforeEach(() => {
    manager = new WorkflowHistoryManager(5); // Small size for testing
  });
  
  describe('push', () => {
    it('should add states to history', () => {
      const w1 = createWorkflow('w1');
      const w2 = createWorkflow('w2');
      
      manager.push(w1, 'Initial');
      manager.push(w2, 'Edit');
      
      const info = manager.getHistoryInfo();
      expect(info.total).toBe(2);
      expect(info.current).toBe(2);
    });
    
    it('should limit history size', () => {
      for (let i = 0; i < 10; i++) {
        manager.push(createWorkflow(`w${i}`), `Edit ${i}`);
      }
      
      const info = manager.getHistoryInfo();
      expect(info.total).toBe(5); // Limited to maxSize
    });
    
    it('should clear future history on branch', () => {
      manager.push(createWorkflow('w1'), 'Step 1');
      manager.push(createWorkflow('w2'), 'Step 2');
      manager.push(createWorkflow('w3'), 'Step 3');
      
      manager.undo();
      manager.undo();
      
      manager.push(createWorkflow('w4'), 'New branch');
      
      const info = manager.getHistoryInfo();
      expect(info.total).toBe(2); // w1 and w4
      expect(info.canRedo).toBe(false);
    });
    
    it('should deep clone workflow states', () => {
      const original = createWorkflow('w1');
      manager.push(original, 'Initial');
      
      // Modify original after pushing
      original.title = 'Modified';
      
      const stored = manager.getCurrent();
      expect(stored?.workflow.title).toBe('Workflow w1'); // Should not be modified
    });
  });
  
  describe('undo/redo', () => {
    it('should navigate through history', () => {
      const w1 = createWorkflow('w1');
      const w2 = createWorkflow('w2');
      const w3 = createWorkflow('w3');
      
      manager.push(w1, 'First');
      manager.push(w2, 'Second');
      manager.push(w3, 'Third');
      
      expect(manager.getCurrent()?.workflow.id).toBe('w3');
      
      manager.undo();
      expect(manager.getCurrent()?.workflow.id).toBe('w2');
      
      manager.undo();
      expect(manager.getCurrent()?.workflow.id).toBe('w1');
      
      manager.redo();
      expect(manager.getCurrent()?.workflow.id).toBe('w2');
    });
    
    it('should respect boundaries', () => {
      manager.push(createWorkflow('w1'), 'Only');
      
      expect(manager.canUndo()).toBe(false);
      expect(manager.undo()).toBeNull();
      
      manager.push(createWorkflow('w2'), 'Second');
      expect(manager.canUndo()).toBe(true);
      expect(manager.canRedo()).toBe(false);
      
      manager.undo();
      expect(manager.canRedo()).toBe(true);
    });
    
    it('should handle empty history', () => {
      expect(manager.canUndo()).toBe(false);
      expect(manager.canRedo()).toBe(false);
      expect(manager.undo()).toBeNull();
      expect(manager.redo()).toBeNull();
      expect(manager.getCurrent()).toBeNull();
    });
    
    it('should not allow undo past first item', () => {
      const w1 = createWorkflow('w1');
      const w2 = createWorkflow('w2');
      
      manager.push(w1, 'First');
      manager.push(w2, 'Second');
      
      manager.undo(); // Back to w1
      expect(manager.getCurrent()?.workflow.id).toBe('w1');
      
      const result = manager.undo(); // Should not go further
      expect(result).toBeNull();
      expect(manager.getCurrent()?.workflow.id).toBe('w1');
    });
    
    it('should not allow redo past last item', () => {
      const w1 = createWorkflow('w1');
      const w2 = createWorkflow('w2');
      
      manager.push(w1, 'First');
      manager.push(w2, 'Second');
      
      manager.undo();
      manager.redo(); // Back to w2
      
      const result = manager.redo(); // Should not go further
      expect(result).toBeNull();
      expect(manager.getCurrent()?.workflow.id).toBe('w2');
    });
  });
  
  describe('getHistoryInfo', () => {
    it('should provide accurate history information', () => {
      manager.push(createWorkflow('w1'), 'Load');
      manager.push(createWorkflow('w2'), 'Add step');
      manager.push(createWorkflow('w3'), 'Remove step');
      
      manager.undo();
      
      const info = manager.getHistoryInfo();
      expect(info.current).toBe(2);
      expect(info.total).toBe(3);
      expect(info.canUndo).toBe(true);
      expect(info.canRedo).toBe(true);
      expect(info.recentActions).toContain('→ Add step');
    });
    
    it('should show correct recent actions window', () => {
      for (let i = 1; i <= 7; i++) {
        manager.push(createWorkflow(`w${i}`), `Action ${i}`);
      }
      
      // Move to middle position
      manager.undo();
      manager.undo();
      
      const info = manager.getHistoryInfo();
      expect(info.recentActions).toHaveLength(5); // Should show 5 items window
      expect(info.recentActions.some(action => action.includes('→'))).toBe(true); // Current item marked
    });
    
    it('should handle edge cases in recent actions', () => {
      manager.push(createWorkflow('w1'), 'Single');
      
      const info = manager.getHistoryInfo();
      expect(info.recentActions).toHaveLength(1);
      expect(info.recentActions[0]).toContain('→ Single');
    });
  });
  
  describe('clear', () => {
    it('should clear all history', () => {
      manager.push(createWorkflow('w1'), 'First');
      manager.push(createWorkflow('w2'), 'Second');
      
      expect(manager.getHistoryInfo().total).toBe(2);
      
      manager.clear();
      
      const info = manager.getHistoryInfo();
      expect(info.total).toBe(0);
      expect(info.current).toBe(0);
      expect(info.canUndo).toBe(false);
      expect(info.canRedo).toBe(false);
      expect(manager.getCurrent()).toBeNull();
    });
  });
  
  describe('getDebugInfo', () => {
    it('should provide formatted debug information', () => {
      manager.push(createWorkflow('w1'), 'First');
      manager.push(createWorkflow('w2'), 'Second');
      manager.undo();
      
      const debug = manager.getDebugInfo();
      expect(debug).toContain('→'); // Current item marker
      expect(debug).toContain('First');
      expect(debug).toContain('Second');
      expect(debug).toMatch(/\[\d+\]/); // Index format
    });
  });
  
  describe('memory management', () => {
    it('should limit memory usage with size constraint', () => {
      const smallManager = new WorkflowHistoryManager(3);
      
      for (let i = 1; i <= 5; i++) {
        smallManager.push(createWorkflow(`w${i}`), `Step ${i}`);
      }
      
      const info = smallManager.getHistoryInfo();
      expect(info.total).toBe(3);
      
      // Should contain the last 3 items
      smallManager.undo();
      smallManager.undo();
      const current = smallManager.getCurrent();
      expect(current?.workflow.id).toBe('w3'); // First of the kept items
    });
  });
  
  describe('state integrity', () => {
    it('should maintain state integrity during navigation', () => {
      const workflows = [
        createWorkflow('w1'),
        createWorkflow('w2'),
        createWorkflow('w3')
      ];
      
      workflows.forEach((w, i) => {
        manager.push(w, `Step ${i + 1}`);
      });
      
      // Navigate through history and verify states
      manager.undo();
      expect(manager.getCurrent()?.workflow.id).toBe('w2');
      
      manager.undo();
      expect(manager.getCurrent()?.workflow.id).toBe('w1');
      
      manager.redo();
      expect(manager.getCurrent()?.workflow.id).toBe('w2');
      
      manager.redo();
      expect(manager.getCurrent()?.workflow.id).toBe('w3');
      
      // Verify canUndo/canRedo states are consistent
      expect(manager.canRedo()).toBe(false);
      expect(manager.canUndo()).toBe(true);
    });
  });
});

describe('describeAction', () => {
  it('should generate appropriate action descriptions', () => {
    expect(describeAction('add_step', { stepId: 'process-data' }))
      .toBe('Add step process-data');
    
    expect(describeAction('remove_step', { stepId: 'validate-input' }))
      .toBe('Remove step validate-input');
    
    expect(describeAction('update_step', { stepId: 'transform' }))
      .toBe('Update step transform');
    
    expect(describeAction('add_edge', { condition: 'success' }))
      .toBe('Add edge success');
    
    expect(describeAction('update_field', { field: 'title' }))
      .toBe('Update title');
  });
  
  it('should handle missing details gracefully', () => {
    expect(describeAction('add_step')).toBe('Add step new');
    expect(describeAction('remove_step')).toBe('Remove step ');
    expect(describeAction('update_field')).toBe('Update field');
  });
  
  it('should return unknown actions as-is', () => {
    expect(describeAction('unknown_action')).toBe('unknown_action');
    expect(describeAction('custom_operation', { stepId: 'test' }))
      .toBe('custom_operation');
  });
  
  it('should handle standard workflow actions', () => {
    expect(describeAction('load')).toBe('Load workflow');
    expect(describeAction('reset')).toBe('Reset changes');
    expect(describeAction('duplicate_step', { stepId: 'copy-1' }))
      .toBe('Duplicate step copy-1');
  });
});
