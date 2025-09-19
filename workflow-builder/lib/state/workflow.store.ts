'use client';

import { create } from 'zustand';
import type { Flow, ValidationError } from '@/lib/workflow-core';

interface WorkflowState {
  currentWorkflow: Flow | null;
  validationErrors: ValidationError[];
  isValid: boolean;
  setWorkflow: (workflow: Flow | null, errors?: ValidationError[]) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  currentWorkflow: null,
  validationErrors: [],
  isValid: false,
  setWorkflow: (workflow, errors = []) => set({
    currentWorkflow: workflow,
    validationErrors: errors,
    isValid: workflow !== null && errors.filter(e => e.severity === 'error').length === 0
  }),
  clearWorkflow: () => set({
    currentWorkflow: null,
    validationErrors: [],
    isValid: false
  })
}));
