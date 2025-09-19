'use client';

import { create } from 'zustand';
import type { Flow, Step, ValidationError } from '@/lib/workflow-core';
import { 
  updateStep as updateStepAPI, 
  validateWorkflow
} from '@/lib/workflow-core';
import { 
  addStep as addStepAPI,
  removeStep as removeStepAPI,
  duplicateStep as duplicateStepAPI,
  addEdge as addEdgeAPI,
  updateEdge as updateEdgeAPI,
  removeEdge as removeEdgeAPI
} from '@/lib/workflow-core/api';
import { generateStepId } from '@/lib/workflow-core/templates';
import { WorkflowHistoryManager, describeAction } from '@/lib/workflow-core/history-manager';

interface WorkflowState {
  currentWorkflow: Flow | null;
  originalWorkflow: Flow | null; // Track original for comparison
  validationErrors: ValidationError[];
  isValid: boolean;
  selectedStepId: string | null;
  selectedStep: Step | null;
  editMode: boolean;
  isDirty: boolean; // Track if changes were made
  history: WorkflowHistoryManager;
  canUndo: boolean;
  canRedo: boolean;
  
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  updateWorkflow: (workflow: Flow, errors?: ValidationError[], actionDescription?: string) => void;
  clearWorkflow: () => void;
  selectStep: (stepId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
  updateSelectedStep: (updates: Partial<Step>) => Promise<void>;
  markAsSaved: () => void;
  addStep: (step: Step, position?: number) => void;
  removeStep: (stepId: string) => void;
  duplicateStep: (stepId: string) => void;
  addEdge: (sourceStepId: string, targetStepId: string, condition: string) => void;
  updateEdge: (sourceStepId: string, edgeIndex: number, newCondition: string, newTargetId?: string) => void;
  removeEdge: (sourceStepId: string, edgeIndex: number) => void;
  undo: () => void;
  redo: () => void;
  getHistoryInfo: () => any;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  originalWorkflow: null,
  validationErrors: [],
  isValid: false,
  selectedStepId: null,
  selectedStep: null,
  editMode: false,
  isDirty: false,
  history: new WorkflowHistoryManager(),
  canUndo: false,
  canRedo: false,
  
  setWorkflow: (workflow, errors = []) => {
    const history = new WorkflowHistoryManager(); // New history for new workflow
    
    if (workflow) {
      history.push(workflow, 'Load workflow');
    }
    
    set({
      currentWorkflow: workflow,
      originalWorkflow: workflow ? JSON.parse(JSON.stringify(workflow)) : null,
      validationErrors: errors,
      isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0,
      isDirty: false,
      history,
      canUndo: history.canUndo(),
      canRedo: history.canRedo()
    });
  },
  
  updateWorkflow: (workflow, errors = [], actionDescription = 'Edit') => {
    const state = get();
    const isDirty = JSON.stringify(workflow) !== JSON.stringify(state.originalWorkflow);
    
    // Add to history
    state.history.push(workflow, actionDescription);
    
    set({
      currentWorkflow: workflow,
      validationErrors: errors,
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      isDirty,
      canUndo: state.history.canUndo(),
      canRedo: state.history.canRedo()
    });
  },
  
  clearWorkflow: () => set({
    currentWorkflow: null,
    originalWorkflow: null,
    validationErrors: [],
    isValid: false,
    selectedStepId: null,
    selectedStep: null,
    editMode: false,
    isDirty: false,
    history: new WorkflowHistoryManager(),
    canUndo: false,
    canRedo: false
  }),
  
  selectStep: (stepId) => {
    const state = get();
    const step = stepId && state.currentWorkflow?.steps 
      ? state.currentWorkflow.steps.find(s => s.id === stepId)
      : null;
    
    set({
      selectedStepId: stepId,
      selectedStep: step || null
    });
  },
  
  setEditMode: (enabled) => set({ editMode: enabled }),
  
  updateSelectedStep: async (updates) => {
    const state = get();
    if (!state.selectedStepId || !state.currentWorkflow) return;
    
    const result = updateStepAPI(state.currentWorkflow, state.selectedStepId, updates);
    
    if (result.success) {
      // Validate the updated workflow
      const errors = await validateWorkflow(result.data);
      
      // Generate action description
      const actionDesc = describeAction('update_step', { stepId: state.selectedStepId });
      
      // Update workflow using updateWorkflow to properly track isDirty
      state.updateWorkflow(result.data, errors, actionDesc);
      
      // Update selected step reference
      const updatedStep = result.data.steps?.find(s => s.id === state.selectedStepId);
      if (updatedStep) {
        set({ selectedStep: updatedStep });
      }
    }
  },
  
  markAsSaved: () => {
    const state = get();
    set({
      originalWorkflow: state.currentWorkflow ? 
        JSON.parse(JSON.stringify(state.currentWorkflow)) : null,
      isDirty: false
    });
  },

  addStep: async (step, position) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = addStepAPI(state.currentWorkflow, step, position);
    
    if (result.success && result.data) {
      const validation = await validateWorkflow(result.data);
      const actionDesc = describeAction('add_step', { stepId: step.id || 'unknown' });
      state.updateWorkflow(result.data, validation, actionDesc);
    } else if (!result.success) {
      console.error('Failed to add step:', result.error);
    }
  },
  
  removeStep: async (stepId) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    // Deselect if removing selected step
    if (state.selectedStepId === stepId) {
      state.selectStep(null);
    }
    
    const result = removeStepAPI(state.currentWorkflow, stepId);
    
    if (result.success && result.data) {
      const validation = await validateWorkflow(result.data);
      const actionDesc = describeAction('remove_step', { stepId });
      state.updateWorkflow(result.data, validation, actionDesc);
    } else if (!result.success) {
      console.error('Failed to remove step:', result.error);
    }
  },
  
  duplicateStep: async (stepId) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const existingIds = state.currentWorkflow.steps?.map(s => s.id).filter(id => id != null) as string[] || [];
    const newId = generateStepId(stepId, existingIds);
    
    const result = duplicateStepAPI(state.currentWorkflow, stepId, newId);
    
    if (result.success && result.data) {
      const validation = await validateWorkflow(result.data);
      const actionDesc = describeAction('duplicate_step', { stepId: newId });
      state.updateWorkflow(result.data, validation, actionDesc);
      // Select the new step
      state.selectStep(newId);
    } else if (!result.success) {
      console.error('Failed to duplicate step:', result.error);
    }
  },

  addEdge: async (sourceStepId, targetStepId, condition) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = addEdgeAPI(state.currentWorkflow, sourceStepId, targetStepId, condition);
    
    if (result.success && result.data) {
      const validation = await validateWorkflow(result.data);
      const actionDesc = describeAction('add_edge', { condition });
      state.updateWorkflow(result.data, validation, actionDesc);
      
      // Update selected step reference if it's the source step
      if (state.selectedStepId === sourceStepId) {
        const updatedStep = result.data.steps?.find(s => s.id === sourceStepId);
        if (updatedStep) {
          set({ selectedStep: updatedStep });
        }
      }
    } else if (!result.success) {
      console.error('Failed to add edge:', result.error);
    }
  },
  
  updateEdge: async (sourceStepId, edgeIndex, newCondition, newTargetId) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = updateEdgeAPI(state.currentWorkflow, sourceStepId, edgeIndex, newCondition, newTargetId);
    
    if (result.success && result.data) {
      const validation = await validateWorkflow(result.data);
      const actionDesc = describeAction('update_edge', { condition: newCondition });
      state.updateWorkflow(result.data, validation, actionDesc);
      
      // Update selected step reference if it's the source step
      if (state.selectedStepId === sourceStepId) {
        const updatedStep = result.data.steps?.find(s => s.id === sourceStepId);
        if (updatedStep) {
          set({ selectedStep: updatedStep });
        }
      }
    } else if (!result.success) {
      console.error('Failed to update edge:', result.error);
    }
  },
  
  removeEdge: async (sourceStepId, edgeIndex) => {
    const state = get();
    if (!state.currentWorkflow) return;
    
    const result = removeEdgeAPI(state.currentWorkflow, sourceStepId, edgeIndex);
    
    if (result.success && result.data) {
      const validation = await validateWorkflow(result.data);
      const actionDesc = describeAction('remove_edge', { stepId: sourceStepId });
      state.updateWorkflow(result.data, validation, actionDesc);
      
      // Update selected step reference if it's the source step
      if (state.selectedStepId === sourceStepId) {
        const updatedStep = result.data.steps?.find(s => s.id === sourceStepId);
        if (updatedStep) {
          set({ selectedStep: updatedStep });
        }
      }
    } else if (!result.success) {
      console.error('Failed to remove edge:', result.error);
    }
  },

  undo: () => {
    const state = get();
    const previousState = state.history.undo();
    
    if (previousState) {
      const isDirty = JSON.stringify(previousState.workflow) !== 
                      JSON.stringify(state.originalWorkflow);
      
      set({
        currentWorkflow: previousState.workflow,
        validationErrors: [], // Will be revalidated if needed
        isValid: true, // Assume history states are valid
        isDirty,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo()
      });

      // Update selected step reference if it still exists
      if (state.selectedStepId) {
        const step = previousState.workflow.steps?.find(s => s.id === state.selectedStepId);
        if (step) {
          set({ selectedStep: step });
        } else {
          set({ selectedStepId: null, selectedStep: null });
        }
      }
    }
  },
  
  redo: () => {
    const state = get();
    const nextState = state.history.redo();
    
    if (nextState) {
      const isDirty = JSON.stringify(nextState.workflow) !== 
                      JSON.stringify(state.originalWorkflow);
      
      set({
        currentWorkflow: nextState.workflow,
        validationErrors: [], // Will be revalidated if needed
        isValid: true, // Assume history states are valid
        isDirty,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo()
      });

      // Update selected step reference if it still exists
      if (state.selectedStepId) {
        const step = nextState.workflow.steps?.find(s => s.id === state.selectedStepId);
        if (step) {
          set({ selectedStep: step });
        } else {
          set({ selectedStepId: null, selectedStep: null });
        }
      }
    }
  },
  
  getHistoryInfo: () => {
    const state = get();
    return state.history.getHistoryInfo();
  }
}));
