'use client';

import { useWorkflowStore } from '@/lib/state/workflow.store';
import styles from './step-inspector.module.css';

export function StepInspector() {
  const { selectedStep, selectedStepId, editMode } = useWorkflowStore();

  if (!selectedStep) {
    return (
      <div className={styles.inspector}>
        <div className={styles.emptyState}>
          <p>Select a step to view its details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inspector}>
      <div className={styles.header}>
        <h3>Step Details</h3>
        {selectedStepId && <code className={styles.stepId}>{selectedStepId}</code>}
      </div>

      <div className={styles.content}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h4>Basic Information</h4>
          <div className={styles.field}>
            <label>Title</label>
            <div className={styles.value}>{selectedStep.title || 'Untitled'}</div>
          </div>
          <div className={styles.field}>
            <label>Role</label>
            <div className={styles.value}>{selectedStep.role || 'Not specified'}</div>
          </div>
          {selectedStep.desc && (
            <div className={styles.field}>
              <label>Description</label>
              <div className={styles.value}>{selectedStep.desc}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {selectedStep.instructions && selectedStep.instructions.length > 0 && (
          <div className={styles.section}>
            <h4>Instructions ({selectedStep.instructions.length})</h4>
            <ol className={styles.instructionsList}>
              {selectedStep.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}

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
