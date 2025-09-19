'use client';

import { create } from 'zustand';
import type { Flow, Step, ValidationError } from '@/lib/workflow-core';

interface WorkflowState {
  currentWorkflow: Flow | null;
  validationErrors: ValidationError[];
  isValid: boolean;
  selectedStepId: string | null;
  selectedStep: Step | null;
  editMode: boolean;
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
  selectStep: (stepId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  currentWorkflow: null,
  validationErrors: [],
  isValid: false,
  selectedStepId: null,
  selectedStep: null,
  editMode: false,
  
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0
  }),
  
  clearWorkflow: () => set({
    currentWorkflow: null,
    validationErrors: [],
    isValid: false,
    selectedStepId: null,
    selectedStep: null,
    editMode: false
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
  
  setEditMode: (enabled) => set({ editMode: enabled })
}));
