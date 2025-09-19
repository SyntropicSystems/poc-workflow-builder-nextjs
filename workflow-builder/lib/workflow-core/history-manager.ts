import type { Flow } from './generated';

export interface HistoryState {
  workflow: Flow;
  timestamp: number;
  description: string;
}

export class WorkflowHistoryManager {
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;
  
  constructor(maxSize: number = 50) {
    this.maxHistorySize = maxSize;
  }
  
  /**
   * Add a new state to history
   */
  push(workflow: Flow, description: string = 'Edit'): void {
    // Remove any states after current index (branching)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add new state
    this.history.push({
      workflow: JSON.parse(JSON.stringify(workflow)), // Deep clone
      timestamp: Date.now(),
      description
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }
  
  /**
   * Undo to previous state
   */
  undo(): HistoryState | null {
    if (!this.canUndo()) {
      return null;
    }
    
    this.currentIndex--;
    return this.history[this.currentIndex];
  }
  
  /**
   * Redo to next state
   */
  redo(): HistoryState | null {
    if (!this.canRedo()) {
      return null;
    }
    
    this.currentIndex++;
    return this.history[this.currentIndex];
  }
  
  /**
   * Get current state
   */
  getCurrent(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }
  
  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
  
  /**
   * Get history information
   */
  getHistoryInfo(): {
    current: number;
    total: number;
    canUndo: boolean;
    canRedo: boolean;
    recentActions: string[];
  } {
    const recentActions = this.history
      .slice(Math.max(0, this.currentIndex - 2), this.currentIndex + 3)
      .map((state, index) => {
        const actualIndex = Math.max(0, this.currentIndex - 2) + index;
        const isCurrent = actualIndex === this.currentIndex;
        return `${isCurrent ? '→ ' : '  '}${state.description}`;
      });
    
    return {
      current: this.currentIndex + 1,
      total: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      recentActions
    };
  }
  
  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
  
  /**
   * Get a compressed representation for debugging
   */
  getDebugInfo(): string {
    return this.history.map((state, index) => {
      const marker = index === this.currentIndex ? '→' : ' ';
      const time = new Date(state.timestamp).toLocaleTimeString();
      return `${marker} [${index}] ${time}: ${state.description}`;
    }).join('\n');
  }
}

/**
 * Generate descriptive action names
 */
export function describeAction(
  action: string,
  details?: { stepId?: string; condition?: string; field?: string }
): string {
  const actionDescriptions: { [key: string]: string } = {
    'add_step': `Add step ${details?.stepId || 'new'}`,
    'remove_step': `Remove step ${details?.stepId || ''}`,
    'update_step': `Update step ${details?.stepId || ''}`,
    'duplicate_step': `Duplicate step ${details?.stepId || ''}`,
    'add_edge': `Add edge ${details?.condition || ''}`,
    'remove_edge': `Remove edge ${details?.condition || ''}`,
    'update_edge': `Update edge ${details?.condition || ''}`,
    'update_field': `Update ${details?.field || 'field'}`,
    'load': 'Load workflow',
    'reset': 'Reset changes'
  };
  
  return actionDescriptions[action] || action;
}
