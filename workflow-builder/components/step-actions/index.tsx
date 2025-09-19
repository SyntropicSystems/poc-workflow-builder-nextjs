'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { AddStepModal } from '@/components/add-step-modal';
import styles from './step-actions.module.css';

export function StepActions() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const { 
    currentWorkflow, 
    selectedStepId, 
    editMode,
    removeStep,
    duplicateStep
  } = useWorkflowStore();
  
  if (!editMode || !currentWorkflow) {
    return null;
  }
  
  const handleDelete = async () => {
    if (confirmDelete && selectedStepId) {
      await removeStep(selectedStepId);
      setConfirmDelete(null);
    } else if (selectedStepId) {
      setConfirmDelete(selectedStepId);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };
  
  const handleDuplicate = async () => {
    if (selectedStepId) {
      await duplicateStep(selectedStepId);
    }
  };
  
  const stepCount = currentWorkflow.steps?.length || 0;
  
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className={styles.addButton}
          title="Add new step"
          type="button"
        >
          + Add Step
        </button>
        
        {selectedStepId && (
          <>
            <button 
              onClick={handleDuplicate}
              className={styles.duplicateButton}
              title="Duplicate selected step"
              type="button"
            >
              Duplicate
            </button>
            
            <button 
              onClick={handleDelete}
              className={`${styles.deleteButton} ${
                confirmDelete === selectedStepId ? styles.deleteConfirm : ''
              }`}
              title={confirmDelete === selectedStepId ? 
                "Click again to confirm delete" : 
                "Delete selected step"
              }
              type="button"
            >
              {confirmDelete === selectedStepId ? 'Confirm Delete?' : 'Delete'}
            </button>
          </>
        )}
        
        <span className={styles.stepCount}>
          {stepCount} step{stepCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      <AddStepModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
