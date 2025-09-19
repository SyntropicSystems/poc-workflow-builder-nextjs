'use client';

import { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import type { Step } from '@/lib/workflow-core';
import styles from './step-inspector.module.css';

export function EditableStepInspector() {
  const { 
    selectedStep, 
    selectedStepId, 
    updateSelectedStep,
    validationErrors 
  } = useWorkflowStore();
  
  const [localStep, setLocalStep] = useState<Partial<Step> | null>(null);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedStep) {
      setLocalStep({ ...selectedStep });
      setIsEditing({});
    } else {
      setLocalStep(null);
    }
  }, [selectedStep, selectedStepId]);

  if (!selectedStep || !localStep) {
    return (
      <div className={styles.inspector}>
        <div className={styles.emptyState}>
          <p>Select a step to edit its details</p>
        </div>
      </div>
    );
  }

  const handleFieldEdit = (field: string) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleFieldSave = async (field: keyof Step, value: any) => {
    await updateSelectedStep({ [field]: value });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleFieldCancel = (field: string) => {
    setLocalStep({ ...selectedStep });
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...(localStep.instructions || [])];
    newInstructions[index] = value;
    setLocalStep({ ...localStep, instructions: newInstructions });
  };

  const addInstruction = () => {
    const newInstructions = [...(localStep.instructions || []), ''];
    setLocalStep({ ...localStep, instructions: newInstructions });
  };

  const removeInstruction = (index: number) => {
    const newInstructions = (localStep.instructions || []).filter((_, i) => i !== index);
    setLocalStep({ ...localStep, instructions: newInstructions });
  };

  const saveInstructions = async () => {
    await updateSelectedStep({ instructions: localStep.instructions });
    setIsEditing({ ...isEditing, instructions: false });
  };

  // Get validation errors for this step
  const stepErrors = validationErrors.filter(e => 
    e.path.includes(selectedStepId || '') || e.path.includes(`steps[`)
  );

  return (
    <div className={styles.inspector}>
      <div className={styles.header}>
        <h3>Edit Step</h3>
        {selectedStepId && <code className={styles.stepId}>{selectedStepId}</code>}
      </div>

      {stepErrors.length > 0 && (
        <div className={styles.errors}>
          {stepErrors.map((error, index) => (
            <div key={index} className={styles.error}>
              {error.message}
            </div>
          ))}
        </div>
      )}

      <div className={styles.content}>
        {/* Title Field */}
        <div className={styles.section}>
          <h4>Basic Information</h4>
          <div className={styles.field}>
            <label>Title</label>
            {isEditing.title ? (
              <div className={styles.editGroup}>
                <input
                  type="text"
                  value={localStep.title || ''}
                  onChange={(e) => setLocalStep({ ...localStep, title: e.target.value })}
                  className={styles.input}
                />
                <button 
                  onClick={() => handleFieldSave('title', localStep.title)}
                  className={styles.saveBtn}
                >
                  Save
                </button>
                <button 
                  onClick={() => handleFieldCancel('title')}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                className={styles.editableValue}
                onClick={() => handleFieldEdit('title')}
              >
                {selectedStep.title || 'Click to add title'}
              </div>
            )}
          </div>

          {/* Role Field */}
          <div className={styles.field}>
            <label>Role</label>
            {isEditing.role ? (
              <div className={styles.editGroup}>
                <select
                  value={localStep.role || ''}
                  onChange={(e) => setLocalStep({ ...localStep, role: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Select role</option>
                  <option value="human">Human</option>
                  <option value="human_ai">Human + AI</option>
                  <option value="ai">AI</option>
                  <option value="automation">Automation</option>
                  <option value="system">System</option>
                </select>
                <button 
                  onClick={() => handleFieldSave('role', localStep.role)}
                  className={styles.saveBtn}
                >
                  Save
                </button>
                <button 
                  onClick={() => handleFieldCancel('role')}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                className={styles.editableValue}
                onClick={() => handleFieldEdit('role')}
              >
                {selectedStep.role || 'Click to set role'}
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className={styles.field}>
            <label>Description</label>
            {isEditing.desc ? (
              <div className={styles.editGroup}>
                <textarea
                  value={localStep.desc || ''}
                  onChange={(e) => setLocalStep({ ...localStep, desc: e.target.value })}
                  className={styles.textarea}
                  rows={3}
                />
                <button 
                  onClick={() => handleFieldSave('desc', localStep.desc)}
                  className={styles.saveBtn}
                >
                  Save
                </button>
                <button 
                  onClick={() => handleFieldCancel('desc')}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                className={styles.editableValue}
                onClick={() => handleFieldEdit('desc')}
              >
                {selectedStep.desc || 'Click to add description'}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.section}>
          <h4>
            Instructions
            {!isEditing.instructions && (
              <button 
                onClick={() => handleFieldEdit('instructions')}
                className={styles.editBtn}
              >
                Edit
              </button>
            )}
          </h4>
          
          {isEditing.instructions ? (
            <div className={styles.instructionsEdit}>
              {localStep.instructions?.map((instruction, index) => (
                <div key={index} className={styles.instructionItem}>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className={styles.textarea}
                    rows={2}
                  />
                  <button 
                    onClick={() => removeInstruction(index)}
                    className={styles.removeBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className={styles.instructionActions}>
                <button onClick={addInstruction} className={styles.addBtn}>
                  + Add Instruction
                </button>
                <button onClick={saveInstructions} className={styles.saveBtn}>
                  Save All
                </button>
                <button 
                  onClick={() => handleFieldCancel('instructions')}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <ol className={styles.instructionsList}>
              {selectedStep.instructions?.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              )) || <li className={styles.empty}>No instructions defined</li>}
            </ol>
          )}
        </div>

        {/* Display other read-only sections */}
        {/* Acceptance Criteria */}
        {selectedStep.acceptance?.checks && selectedStep.acceptance.checks.length > 0 && (
          <div className={styles.section}>
            <h4>Acceptance Criteria ({selectedStep.acceptance.checks.length})</h4>
            <ul className={styles.checksList}>
              {selectedStep.acceptance.checks.map((check, index) => (
                <li key={index}>
                  {check.kind && <span className={styles.checkKind}>[{check.kind}]</span>}
                  {check.path || check.expr || 'Check defined'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Token Scope */}
        {selectedStep.token && (
          <div className={styles.section}>
            <h4>Token Scope</h4>
            <div className={styles.tokenInfo}>
              {selectedStep.token.advisory && (
                <div className={styles.advisory}>Advisory mode</div>
              )}
              {selectedStep.token.scope && (
                <div className={styles.scope}>
                  {Object.entries(selectedStep.token.scope).map(([key, value]) => (
                    <div key={key} className={styles.scopeItem}>
                      <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {selectedStep.next && selectedStep.next.length > 0 && (
          <div className={styles.section}>
            <h4>Next Steps</h4>
            <ul className={styles.nextList}>
              {selectedStep.next.map((next, index) => (
                <li key={index}>
                  → {next.to}
                  {next.when && <span className={styles.condition}> (when: {next.when})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
