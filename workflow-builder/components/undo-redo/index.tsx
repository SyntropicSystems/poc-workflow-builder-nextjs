'use client';

import { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/lib/state/workflow.store';
import styles from './undo-redo.module.css';

export function UndoRedoControls() {
  const { 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    editMode,
    getHistoryInfo 
  } = useWorkflowStore();
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyInfo, setHistoryInfo] = useState<any>(null);
  
  useEffect(() => {
    if (showHistory) {
      const info = getHistoryInfo();
      setHistoryInfo(info);
    }
  }, [showHistory, canUndo, canRedo, getHistoryInfo]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editMode) return;
      
      // Ctrl/Cmd + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if ((e.metaKey || e.ctrlKey) && (
        (e.key === 'z' && e.shiftKey) || 
        e.key === 'y'
      )) {
        e.preventDefault();
        if (canRedo) redo();
      }
      
      // Ctrl/Cmd + H for history
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, canUndo, canRedo, undo, redo]);
  
  if (!editMode) {
    return null;
  }
  
  return (
    <>
      <div className={styles.container}>
        <button
          className={styles.button}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          ↶
        </button>
        
        <button
          className={styles.button}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          ↷
        </button>
        
        <button
          className={`${styles.button} ${styles.historyButton}`}
          onClick={() => setShowHistory(!showHistory)}
          title="Show History (Ctrl+H)"
          aria-label="History"
        >
          📜
        </button>
      </div>
      
      {showHistory && historyInfo && (
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <span>History ({historyInfo.current}/{historyInfo.total})</span>
            <button
              className={styles.closeButton}
              onClick={() => setShowHistory(false)}
            >
              ×
            </button>
          </div>
          
          <div className={styles.historyList}>
            {historyInfo.recentActions.map((action: string, index: number) => (
              <div
                key={index}
                className={`${styles.historyItem} ${
                  action.startsWith('→') ? styles.currentItem : ''
                }`}
              >
                {action}
              </div>
            ))}
          </div>
          
          <div className={styles.historyFooter}>
            <small>Use Ctrl+Z/Y to navigate</small>
          </div>
        </div>
      )}
    </>
  );
}
