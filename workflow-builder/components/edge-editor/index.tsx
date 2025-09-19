'use client';

import { useState, useEffect } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import type { Step } from '@/lib/workflow-core/generated';
import styles from './edge-editor.module.css';

interface EdgeEditorProps {
  step: Step;
  onClose?: () => void;
}

interface EdgeData {
  condition: string;
  target: string;
  index: number;
}

export function EdgeEditor({ step, onClose }: EdgeEditorProps) {
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { currentWorkflow, addEdge, updateEdge, removeEdge } = useWorkflowStore();
  
  useEffect(() => {
    // Initialize edges from step
    if (step.next) {
      const edgeList = step.next.map((nextStep, index) => ({
        condition: nextStep.when || '',
        target: nextStep.to || '',
        index
      }));
      setEdges(edgeList);
    } else {
      setEdges([]);
    }
  }, [step]);
  
  const availableTargets = currentWorkflow?.steps
    ?.filter(s => s.id !== step.id)
    ?.map(s => ({ id: s.id!, title: s.title || s.id! })) || [];
  
  const handleAddEdge = () => {
    const conditionPattern = /^[a-z][a-z0-9_]*$/;
    
    if (!newCondition) {
      setError('Condition is required');
      return;
    }
    
    if (!conditionPattern.test(newCondition)) {
      setError('Condition must be lowercase with underscores only');
      return;
    }
    
    if (!newTarget) {
      setError('Target step is required');
      return;
    }
    
    if (edges.some(e => e.condition === newCondition)) {
      setError('Condition already exists');
      return;
    }
    
    // Add edge through store
    addEdge(step.id!, newTarget, newCondition);
    
    setNewCondition('');
    setNewTarget('');
    setError(null);
  };
  
  const handleUpdateEdge = (index: number, condition: string, target: string) => {
    if (!condition || !target) return;
    
    const conditionPattern = /^[a-z][a-z0-9_]*$/;
    if (!conditionPattern.test(condition)) {
      setError('Condition must be lowercase with underscores only');
      return;
    }
    
    // Check for condition conflicts (excluding current edge)
    const otherEdges = edges.filter((_, i) => i !== index);
    if (otherEdges.some(edge => edge.condition === condition)) {
      setError('Condition already exists for this step');
      return;
    }
    
    updateEdge(step.id!, index, condition, target);
    setEditingIndex(null);
    setError(null);
  };
  
  const handleRemoveEdge = (index: number) => {
    removeEdge(step.id!, index);
  };
  
  const suggestCondition = () => {
    const commonConditions = [
      'success', 'failure', 'approved', 'rejected',
      'complete', 'error', 'timeout', 'retry'
    ];
    
    for (const condition of commonConditions) {
      if (!edges.some(e => e.condition === condition)) {
        setNewCondition(condition);
        break;
      }
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Edges for: {step.title || step.id}</h3>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton}>×</button>
        )}
      </div>
      
      <div className={styles.edgeList}>
        {edges.length === 0 && (
          <div className={styles.emptyState}>
            No edges configured. Add one below.
          </div>
        )}
        
        {edges.map((edge, index) => (
          <div key={index} className={styles.edge}>
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={edge.condition}
                  onChange={e => {
                    const updated = [...edges];
                    updated[index].condition = e.target.value;
                    setEdges(updated);
                  }}
                  className={styles.conditionInput}
                />
                <span className={styles.arrow}>→</span>
                <select
                  value={edge.target}
                  onChange={e => {
                    const updated = [...edges];
                    updated[index].target = e.target.value;
                    setEdges(updated);
                  }}
                  className={styles.targetSelect}
                >
                  {availableTargets.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleUpdateEdge(index, edge.condition, edge.target)}
                  className={styles.saveButton}
                  title="Save changes"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditingIndex(null);
                    setError(null);
                    // Reset to original values
                    const originalEdge = step.next?.[index];
                    if (originalEdge) {
                      const updated = [...edges];
                      updated[index].condition = originalEdge.when || '';
                      updated[index].target = originalEdge.to || '';
                      setEdges(updated);
                    }
                  }}
                  className={styles.cancelButton}
                  title="Cancel editing"
                >
                  ×
                </button>
              </>
            ) : (
              <>
                <span className={styles.condition}>{edge.condition}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.target}>{edge.target}</span>
                <div className={styles.edgeActions}>
                  <button
                    onClick={() => setEditingIndex(index)}
                    className={styles.editButton}
                    title="Edit edge"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this edge?')) {
                        handleRemoveEdge(index);
                      }
                    }}
                    className={styles.removeButton}
                    title="Remove edge"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className={styles.addSection}>
        <h4>Add New Edge</h4>
        <div className={styles.addForm}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={newCondition}
              onChange={e => {
                setNewCondition(e.target.value);
                setError(null);
              }}
              placeholder="Condition (e.g., success)"
              className={styles.conditionInput}
            />
            <button onClick={suggestCondition} className={styles.suggestButton}>
              Suggest
            </button>
          </div>
          
          <span className={styles.arrow}>→</span>
          
          <select
            value={newTarget}
            onChange={e => {
              setNewTarget(e.target.value);
              setError(null);
            }}
            className={styles.targetSelect}
          >
            <option value="">Select target...</option>
            {availableTargets.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          
          <button
            onClick={handleAddEdge}
            className={styles.addButton}
            disabled={!newCondition || !newTarget}
          >
            Add Edge
          </button>
        </div>
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}
      </div>
    </div>
  );
}
