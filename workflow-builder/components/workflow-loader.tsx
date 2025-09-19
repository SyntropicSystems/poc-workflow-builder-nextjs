'use client';

import { useState, useEffect } from 'react';
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { loadWorkflow } from '@/lib/workflow-core';
import type { Flow, ValidationError } from '@/lib/workflow-core';

export function WorkflowLoader() {
  const { selectedFile, fileContent } = useFileSystemStore();
  const [workflow, setWorkflow] = useState<Flow | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fileContent && selectedFile) {
      parseWorkflow();
    } else {
      setWorkflow(null);
      setValidationErrors([]);
      setParseError(null);
    }
  }, [fileContent, selectedFile]);

  const parseWorkflow = async () => {
    if (!fileContent) return;

    setIsLoading(true);
    setParseError(null);
    setValidationErrors([]);

    const result = await loadWorkflow(fileContent);

    if (result.success) {
      setWorkflow(result.data);
      // Also run validation to get warnings
      const { validateWorkflow } = await import('@/lib/workflow-core');
      const errors = await validateWorkflow(result.data);
      setValidationErrors(errors.filter(e => e.severity === 'warning'));
    } else {
      setWorkflow(null);
      setParseError(result.error.message);
    }

    setIsLoading(false);
  };

  if (!selectedFile) {
    return null;
  }

  return (
    <div className="workflow-loader">
      <h3>Workflow Status</h3>
      
      {isLoading && (
        <div className="loading">Parsing workflow...</div>
      )}

      {parseError && (
        <div className="parse-error">
          <h4>❌ Parse Error</h4>
          <pre>{parseError}</pre>
        </div>
      )}

      {workflow && (
        <div className="workflow-info">
          <h4>✅ Valid Workflow</h4>
          <dl>
            <dt>ID:</dt>
            <dd>{workflow.id}</dd>
            <dt>Title:</dt>
            <dd>{workflow.title}</dd>
            <dt>Steps:</dt>
            <dd>{workflow.steps?.length || 0}</dd>
            <dt>Policy:</dt>
            <dd>{workflow.policy?.enforcement || 'none'}</dd>
          </dl>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="validation-warnings">
          <h4>⚠️ Warnings</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <strong>{error.path}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
