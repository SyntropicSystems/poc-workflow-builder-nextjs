'use client';

import { useWorkflowStore } from '@/lib/state/workflow.store';
import styles from './edit-mode.module.css';

export function EditModeToggle() {
  const { editMode, setEditMode, currentWorkflow, hasUnsavedChanges } = useWorkflowStore();

  if (!currentWorkflow) {
    return null;
  }

  return (
    <div className={styles.toggleContainer}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={editMode}
          onChange={(e) => setEditMode(e.target.checked)}
        />
        <span className={styles.slider}></span>
        <span className={styles.label}>
          {editMode ? 'Edit Mode' : 'View Mode'}
        </span>
      </label>
      {hasUnsavedChanges && (
        <span className={styles.unsaved}>Unsaved changes</span>
      )}
    </div>
  );
}
