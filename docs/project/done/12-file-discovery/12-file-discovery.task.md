# Task 1.2: File Discovery & Selection (FIXED)

## Objective
Enable users to see and choose from available workflow files (.flow.yaml) in the selected directory.

## Prerequisites
- Task 1.1 completed (directory access working)
- Directory handle stored in Zustand state

## Implementation Steps

### Step 1: Create File Discovery Utilities
Create `lib/fs/file-discovery.ts`:
```typescript
'use client';

export interface WorkflowFile {
  name: string;
  handle: FileSystemFileHandle;
  lastModified?: number;
}

export async function discoverWorkflowFiles(
  directoryHandle: FileSystemDirectoryHandle
): Promise<WorkflowFile[]> {
  const files: WorkflowFile[] = [];

  try {
    // Iterate through directory entries
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.flow.yaml')) {
        // FIX: Type assertion needed for TypeScript
        const file = await (entry as FileSystemFileHandle).getFile();
        files.push({
          name: entry.name,
          handle: entry as FileSystemFileHandle,
          lastModified: file.lastModified
        });
      }
    }

    // Sort by name for consistent display
    files.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error discovering workflow files:', error);
    throw new Error('Failed to read directory contents');
  }

  return files;
}

export async function readFileContent(
  fileHandle: FileSystemFileHandle
): Promise<string> {
  try {
    const file = await fileHandle.getFile();
    const content = await file.text();
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error(`Failed to read file: ${fileHandle.name}`);
  }
}
```

### Step 2: Extend Filesystem Store
Update `lib/state/filesystem.store.ts`:
```typescript
'use client';

import { create } from 'zustand';
import type { WorkflowFile } from '@/lib/fs/file-discovery';

interface FileSystemState {
  directoryHandle: FileSystemDirectoryHandle | null;
  directoryName: string | null;
  workflowFiles: WorkflowFile[];
  selectedFile: WorkflowFile | null;
  fileContent: string | null;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  clearDirectory: () => void;
  setWorkflowFiles: (files: WorkflowFile[]) => void;
  selectFile: (file: WorkflowFile, content: string) => void;
  clearSelection: () => void;
}

export const useFileSystemStore = create<FileSystemState>((set) => ({
  directoryHandle: null,
  directoryName: null,
  workflowFiles: [],
  selectedFile: null,
  fileContent: null,
  setDirectoryHandle: (handle) => set({ 
    directoryHandle: handle,
    directoryName: handle?.name || null 
  }),
  clearDirectory: () => set({ 
    directoryHandle: null,
    directoryName: null,
    workflowFiles: [],
    selectedFile: null,
    fileContent: null
  }),
  setWorkflowFiles: (files) => set({ workflowFiles: files }),
  selectFile: (file, content) => set({ 
    selectedFile: file,
    fileContent: content 
  }),
  clearSelection: () => set({ 
    selectedFile: null,
    fileContent: null 
  })
}));
```

### Step 3: Create File List Component
Create `components/file-list.tsx`:
```typescript
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
      selectFile(file, content);
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
```

### Step 4: Update Main Page
Update `app/page.tsx`:
```typescript
import { DirectorySelector } from '@/components/directory-selector';
import { FileList } from '@/components/file-list';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Workflow Builder</h1>
        <DirectorySelector />
        <FileList />
      </div>
    </main>
  );
}
```

### Step 5: Add Styles for File List
Update `app/globals.css`:
```css
/* Add to existing globals.css */

.file-list {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.file-list-header h3 {
  margin: 0;
}

.refresh-button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #333;
}

.refresh-button:hover {
  background-color: #e0e0e0;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-list-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  padding: 12px;
  margin: 4px 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.file-item.selected {
  background-color: #e6f2ff;
  border-color: #0070f3;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-modified {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.selected-file-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.selected-file-info h4 {
  margin: 0 0 10px 0;
  color: #0070f3;
}

.file-content-preview {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
  word-break: break-all;
}
```

### Step 6: Create Tests
Create `lib/fs/file-discovery.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { discoverWorkflowFiles, readFileContent } from './file-discovery';

describe('File Discovery', () => {
  it('should discover .flow.yaml files', async () => {
    const mockFile = new File(['content'], 'test.flow.yaml', { lastModified: Date.now() });
    const mockHandle = {
      name: 'test.flow.yaml',
      kind: 'file',
      getFile: vi.fn().mockResolvedValue(mockFile)
    };

    const mockDirectory = {
      values: vi.fn().mockImplementation(async function* () {
        yield mockHandle;
      })
    } as any;

    const files = await discoverWorkflowFiles(mockDirectory);
    
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('test.flow.yaml');
    expect(files[0].handle).toBe(mockHandle);
  });

  it('should filter out non-workflow files', async () => {
    const mockFiles = [
      { name: 'test.flow.yaml', kind: 'file', getFile: vi.fn().mockResolvedValue(new File([''], '')) },
      { name: 'readme.md', kind: 'file', getFile: vi.fn() },
      { name: 'folder', kind: 'directory' }
    ];

    const mockDirectory = {
      values: vi.fn().mockImplementation(async function* () {
        for (const file of mockFiles) {
          yield file;
        }
      })
    } as any;

    const files = await discoverWorkflowFiles(mockDirectory);
    
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('test.flow.yaml');
  });

  it('should read file content', async () => {
    const mockContent = 'schema: flowspec.v1\nid: test.v1';
    const mockFile = new File([mockContent], 'test.flow.yaml');
    const mockHandle = {
      name: 'test.flow.yaml',
      getFile: vi.fn().mockResolvedValue(mockFile)
    } as any;

    const content = await readFileContent(mockHandle);
    
    expect(content).toBe(mockContent);
  });
});
```

## Acceptance Tests

Create `scripts/verify-file-discovery.py`:
```python
#!/usr/bin/env python3
import os
import sys
import subprocess

def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_client_directive(filepath):
    """Check that file has 'use client' directive"""
    with open(filepath, 'r') as f:
        first_line = f.readline().strip()
        if first_line != "'use client';":
            print(f"❌ {filepath} missing 'use client' directive")
            return False
    print(f"✅ {filepath} has 'use client' directive")
    return True

def check_type_assertion():
    """Check that file discovery has type assertion for FileSystemFileHandle"""
    filepath = 'lib/fs/file-discovery.ts'
    with open(filepath, 'r') as f:
        content = f.read()
        if '(entry as FileSystemFileHandle)' not in content:
            print(f"❌ Missing type assertion for FileSystemFileHandle")
            return False
    print("✅ Type assertion for FileSystemFileHandle present")
    return True

def check_store_updates():
    """Verify store has new fields"""
    store_file = 'lib/state/filesystem.store.ts'
    required_fields = [
        'workflowFiles:',
        'selectedFile:',
        'fileContent:',
        'setWorkflowFiles:',
        'selectFile:',
        'clearSelection:'
    ]
    
    with open(store_file, 'r') as f:
        content = f.read()
        missing = []
        for field in required_fields:
            if field not in content:
                missing.append(field)
        
        if missing:
            print(f"❌ Store missing fields: {', '.join(missing)}")
            return False
    
    print("✅ Store has all required fields")
    return True

def check_component_integration():
    """Check that FileList is imported in page"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'FileList' not in content or "import { FileList }" not in content:
            print(f"❌ FileList not integrated in main page")
            return False
    
    print("✅ FileList integrated in main page")
    return True

def run_tests():
    """Run file discovery tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/fs/file-discovery.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ File discovery tests pass")
        return True
    
    print(f"❌ Tests failed")
    return False

def main():
    checks = [
        # Check new files exist
        check_file_exists('lib/fs/file-discovery.ts'),
        check_file_exists('components/file-list.tsx'),
        check_file_exists('lib/fs/file-discovery.test.ts'),
        
        # Check client directives
        check_client_directive('lib/fs/file-discovery.ts'),
        check_client_directive('components/file-list.tsx'),
        
        # Check type assertion fix
        check_type_assertion(),
        
        # Check store updates
        check_store_updates(),
        
        # Check integration
        check_component_integration(),
        
        # Run tests
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 File discovery implementation complete!")
        print("Users can now see and select workflow files from the directory.")
        sys.exit(0)
    else:
        print("\n❌ File discovery implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria
- [ ] Files with .flow.yaml extension are listed
- [ ] Type assertion used for FileSystemFileHandle
- [ ] Other files and directories are filtered out
- [ ] File list updates when directory is selected
- [ ] Clicking a file selects it and reads content
- [ ] Selected file is visually highlighted
- [ ] File modified date/time is displayed
- [ ] Content preview shows first 100 characters
- [ ] All client components have 'use client' directive
- [ ] Tests pass for file discovery logic