'use client';

import { useEffect, useState } from 'react';
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { discoverWorkflowFiles, readFileContent } from '@/lib/fs/file-discovery';
import type { WorkflowFile } from '@/lib/fs/file-discovery';

export function FileList() {
  const { 
    directoryHandle, 
    workflowFiles, 
    selectedFile,
    setWorkflowFiles,
    selectFile 
  } = useFileSystemStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Discover files when directory changes
  useEffect(() => {
    if (directoryHandle) {
      loadWorkflowFiles();
    }
  }, [directoryHandle]);

  const loadWorkflowFiles = async () => {
    if (!directoryHandle) return;

    setIsLoading(true);
    setError(null);

    try {
      const files = await discoverWorkflowFiles(directoryHandle);
      setWorkflowFiles(files);
      
      if (files.length === 0) {
        setError('No .flow.yaml files found in this directory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      setWorkflowFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: WorkflowFile) => {
    setError(null);
    
    try {
      const content = await readFileContent(file.handle);
      selectFile(file, content, file.handle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    }
  };

  const formatFileSize = (lastModified?: number) => {
    if (!lastModified) return '';
    const date = new Date(lastModified);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!directoryHandle) {
    return null;
  }

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h3>Workflow Files</h3>
        <button 
          onClick={loadWorkflowFiles} 
          disabled={isLoading}
          className="refresh-button"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {workflowFiles.length > 0 && (
        <ul className="file-list-items">
          {workflowFiles.map((file) => (
            <li 
              key={file.name}
              className={`file-item ${selectedFile?.name === file.name ? 'selected' : ''}`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="file-name">{file.name}</div>
              <div className="file-modified">
                {formatFileSize(file.lastModified)}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedFile && (
        <div className="selected-file-info">
          <h4>Selected: {selectedFile.name}</h4>
          <div className="file-content-preview">
            {useFileSystemStore.getState().fileContent?.slice(0, 100)}...
          </div>
        </div>
      )}
    </div>
  );
}
