'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { STEP_TEMPLATES, generateStepId, createStepFromTemplate, getTemplateOptions } from '@/lib/workflow-core/templates';
import styles from './add-step-modal.module.css';

interface AddStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: number;
}

export function AddStepModal({ isOpen, onClose, position }: AddStepModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [stepId, setStepId] = useState<string>('');
  const [stepTitle, setStepTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const { currentWorkflow, addStep } = useWorkflowStore();
  
  if (!isOpen) return null;
  
  const handleCreate = async () => {
    if (!stepId) {
      setError('Step ID is required');
      return;
    }
    
    // Validate ID format
    const idPattern = /^[a-z][a-z0-9_]*$/;
    if (!idPattern.test(stepId)) {
      setError('Step ID must be lowercase with underscores only');
      return;
    }
    
    // Check for duplicates
    if (currentWorkflow?.steps?.some(s => s.id === stepId)) {
      setError('Step ID already exists');
      return;
    }
    
    const newStep = createStepFromTemplate(selectedTemplate, stepId);
    
    // Override title if provided
    if (stepTitle) {
      newStep.title = stepTitle;
    }
    
    await addStep(newStep, position);
    handleClose();
  };
  
  const handleClose = () => {
    setSelectedTemplate('blank');
    setStepId('');
    setStepTitle('');
    setError(null);
    onClose();
  };
  
  const suggestId = () => {
    if (!currentWorkflow) return;
    const existingIds = currentWorkflow.steps?.map(s => s.id).filter(id => id != null) as string[] || [];
    const prefix = selectedTemplate === 'blank' ? 'step' : selectedTemplate;
    setStepId(generateStepId(prefix, existingIds));
  };
  
  const templateOptions = getTemplateOptions();
  const selectedTemplateOption = templateOptions.find(t => t.value === selectedTemplate);
  
  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2>Add New Step</h2>
        
        <div className={styles.field}>
          <label>Template:</label>
          <select 
            value={selectedTemplate} 
            onChange={e => {
              setSelectedTemplate(e.target.value);
              setError(null);
            }}
          >
            {templateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedTemplateOption && (
            <small className={styles.description}>
              {selectedTemplateOption.description}
            </small>
          )}
        </div>
        
        <div className={styles.field}>
          <label>Step ID: *</label>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={stepId}
              onChange={e => {
                setStepId(e.target.value);
                setError(null);
              }}
              placeholder="e.g., review_step"
              pattern="[a-z][a-z0-9_]*"
            />
            <button 
              onClick={suggestId} 
              className={styles.suggestButton}
              type="button"
            >
              Suggest
            </button>
          </div>
          <small>Lowercase letters, numbers, and underscores only</small>
        </div>
        
        <div className={styles.field}>
          <label>Title:</label>
          <input
            type="text"
            value={stepTitle}
            onChange={e => setStepTitle(e.target.value)}
            placeholder="e.g., Review Document"
          />
          <small>Leave empty to use template default</small>
        </div>
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        
        <div className={styles.actions}>
          <button 
            onClick={handleClose} 
            className={styles.cancelButton}
            type="button"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate} 
            className={styles.createButton}
            type="button"
          >
            Create Step
          </button>
        </div>
      </div>
    </div>
  );
}
