'use client';

import { useState } from 'react';
import { useFileSystemStore } from '@/lib/state/filesystem.store';
import { requestDirectoryAccess, verifyDirectoryPermission } from '@/lib/fs/browser-fs';

export function DirectorySelector() {
  const { directoryHandle, directoryName, setDirectoryHandle, clearDirectory } = useFileSystemStore();
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectDirectory = async () => {
    setIsSelecting(true);
    setError(null);

    try {
      const handle = await requestDirectoryAccess();
      
      if (handle) {
        const hasPermission = await verifyDirectoryPermission(handle);
        if (!hasPermission) {
          throw new Error('Permission denied to access the selected directory');
        }
        setDirectoryHandle(handle);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="directory-selector">
      {!directoryHandle ? (
        <div>
          <button 
            onClick={handleSelectDirectory}
            disabled={isSelecting}
            className="select-button"
          >
            {isSelecting ? 'Selecting...' : 'Select Workflow Directory'}
          </button>
          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}
        </div>
      ) : (
        <div className="directory-info">
          <p>Selected directory: <strong>{directoryName}</strong></p>
          <button 
            onClick={clearDirectory}
            className="clear-button"
          >
            Change Directory
          </button>
        </div>
      )}
    </div>
  );
}
