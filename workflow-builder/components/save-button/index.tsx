'use client';

import { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { saveWorkflow } from '@/lib/workflow-core/api';
import { writeWorkflowFile } from '@/lib/fs/file-operations';
import styles from './save-button.module.css';

export function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { currentWorkflow, isValid, isDirty, markAsSaved } = useWorkflowStore();
  const { selectedFile, selectedFileHandle } = useFileSystemStore();
  
  const handleSave = async () => {
    if (!currentWorkflow || !selectedFileHandle || !isValid) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Convert workflow to YAML
      const result = await saveWorkflow(currentWorkflow);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to serialize workflow');
      }
      
      // Write to file
      await writeWorkflowFile(selectedFileHandle, result.data);
      
      // Mark as saved in store
      markAsSaved();
      setLastSaved(new Date());
      
      // Show success feedback (could be a toast)
      console.log('Workflow saved successfully');
      
    } catch (error) {
      console.error('Save failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && isValid && !isSaving) {
          handleSave();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isValid, isSaving]);
  
  if (!selectedFile) {
    return null;
  }
  
  return (
    <div className={styles.container}>
      <button
        className={styles.saveButton}
        onClick={handleSave}
        disabled={!isDirty || !isValid || isSaving}
        title={!isValid ? 'Fix validation errors before saving' : 'Save workflow (Ctrl+S)'}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      
      {isDirty && (
        <span className={styles.unsavedIndicator}>●</span>
      )}
      
      {lastSaved && (
        <span className={styles.lastSaved}>
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
      
      {saveError && (
        <div className={styles.error}>{saveError}</div>
      )}
    </div>
  );
}
