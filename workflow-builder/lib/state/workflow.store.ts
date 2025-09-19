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
  duplicateStep as duplicateStepAPI
} from '@/lib/workflow-core/api';
import { generateStepId } from '@/lib/workflow-core/templates';

interface WorkflowState {
  currentWorkflow: Flow | null;
  originalWorkflow: Flow | null; // Track original for comparison
  validationErrors: ValidationError[];
  isValid: boolean;
  selectedStepId: string | null;
  selectedStep: Step | null;
  editMode: boolean;
  isDirty: boolean; // Track if changes were made
  
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  updateWorkflow: (workflow: Flow, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
  selectStep: (stepId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
  updateSelectedStep: (updates: Partial<Step>) => Promise<void>;
  markAsSaved: () => void;
  addStep: (step: Step, position?: number) => void;
  removeStep: (stepId: string) => void;
  duplicateStep: (stepId: string) => void;
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
  
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    originalWorkflow: workflow ? JSON.parse(JSON.stringify(workflow)) : null,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0,
    isDirty: false
  }),
  
  updateWorkflow: (workflow, errors = []) => {
    const state = get();
    const isDirty = JSON.stringify(workflow) !== JSON.stringify(state.originalWorkflow);
    
    set({
      currentWorkflow: workflow,
      validationErrors: errors,
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      isDirty
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
    isDirty: false
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
      
      // Update workflow using updateWorkflow to properly track isDirty
      state.updateWorkflow(result.data, errors);
      
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
      state.updateWorkflow(result.data, validation);
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
      state.updateWorkflow(result.data, validation);
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
      state.updateWorkflow(result.data, validation);
      // Select the new step
      state.selectStep(newId);
    } else if (!result.success) {
      console.error('Failed to duplicate step:', result.error);
    }
  }
}));
