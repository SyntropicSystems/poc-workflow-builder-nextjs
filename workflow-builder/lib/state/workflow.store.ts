'use client';

import { create } from 'zustand';
import type { Flow, Step, ValidationError } from '@/lib/workflow-core';
import { updateStep as updateStepAPI, validateWorkflow } from '@/lib/workflow-core';

interface WorkflowState {
  currentWorkflow: Flow | null;
  validationErrors: ValidationError[];
  isValid: boolean;
  selectedStepId: string | null;
  selectedStep: Step | null;
  editMode: boolean;
  hasUnsavedChanges: boolean;
  
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
  selectStep: (stepId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
  updateSelectedStep: (updates: Partial<Step>) => Promise<void>;
  markAsSaved: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  validationErrors: [],
  isValid: false,
  selectedStepId: null,
  selectedStep: null,
  editMode: false,
  hasUnsavedChanges: false,
  
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0,
    hasUnsavedChanges: false
  }),
  
  clearWorkflow: () => set({
    currentWorkflow: null,
    validationErrors: [],
    isValid: false,
    selectedStepId: null,
    selectedStep: null,
    editMode: false,
    hasUnsavedChanges: false
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
      
      // Update state with new workflow
      set({
        currentWorkflow: result.data,
        validationErrors: errors,
        isValid: errors.filter(e => e.severity === 'error').length === 0,
        hasUnsavedChanges: true
      });
      
      // Update selected step reference
      const updatedStep = result.data.steps?.find(s => s.id === state.selectedStepId);
      if (updatedStep) {
        set({ selectedStep: updatedStep });
      }
    }
  },
  
  markAsSaved: () => set({ hasUnsavedChanges: false })
}));
