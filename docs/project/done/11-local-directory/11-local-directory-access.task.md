# Task 1.1: Local Directory Access (FIXED)

## Objective
Create a client-side UI component that uses the browser's File System Access API to request and store a directory handle.

## Prerequisites
- Phase 0 completed (all foundation tasks)
- Browser with File System Access API support (Chrome/Edge)

## Implementation Steps

### Step 1: Create State Management Store
Create `lib/state/filesystem.store.ts`:
```typescript
'use client';

import { create } from 'zustand';

interface FileSystemState {
  directoryHandle: FileSystemDirectoryHandle | null;
  directoryName: string | null;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  clearDirectory: () => void;
}

export const useFileSystemStore = create<FileSystemState>((set) => ({
  directoryHandle: null,
  directoryName: null,
  setDirectoryHandle: (handle) => set({ 
    directoryHandle: handle,
    directoryName: handle?.name || null 
  }),
  clearDirectory: () => set({ 
    directoryHandle: null,
    directoryName: null 
  }),
}));
```

### Step 2: Create File System Utilities
Create `lib/fs/browser-fs.ts`:
```typescript
'use client';

export async function requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  try {
    // Check if the API is available
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API is not supported in this browser');
    }

    // Request directory access
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });

    return handle;
  } catch (error) {
    // User cancelled or error occurred
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('User cancelled directory selection');
      return null;
    }
    throw error;
  }
}

export async function verifyDirectoryPermission(
  handle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted') {
      return true;
    }
    
    const requestPermission = await handle.requestPermission({ mode: 'readwrite' });
    return requestPermission === 'granted';
  } catch (error) {
    console.error('Permission verification failed:', error);
    return false;
  }
}
```

### Step 3: Create Directory Selector Component
Create `components/directory-selector.tsx`:
```typescript
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
```

### Step 4: Update Main Page (NO 'use client' here!)
Update `app/page.tsx`:
```typescript
import { DirectorySelector } from '@/components/directory-selector';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Workflow Builder</h1>
        <DirectorySelector />
      </div>
    </main>
  );
}
```

### Step 5: Add Basic Styles
Update `app/globals.css`:
```css
/* Add to existing globals.css */

.directory-selector {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 20px 0;
}

.select-button,
.clear-button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #0070f3;
  color: white;
}

.select-button:hover,
.clear-button:hover {
  background-color: #0051cc;
}

.select-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff0000;
  margin-top: 10px;
  padding: 10px;
  background-color: #ffeeee;
  border-radius: 4px;
}

.directory-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
```

### Step 6: Create page.module.css if missing
Create `app/page.module.css`:
```css
.main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
```

### Step 7: Create Integration Test
Create `lib/fs/browser-fs.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { requestDirectoryAccess, verifyDirectoryPermission } from './browser-fs';

describe('Browser File System', () => {
  it('should handle missing API gracefully', async () => {
    // Mock window without the API
    const originalWindow = global.window;
    global.window = {} as any;

    await expect(requestDirectoryAccess()).rejects.toThrow(
      'File System Access API is not supported'
    );

    global.window = originalWindow;
  });

  it('should handle user cancellation', async () => {
    // Mock the API with cancellation
    global.window.showDirectoryPicker = vi.fn().mockRejectedValue(
      new DOMException('User cancelled', 'AbortError')
    );

    const result = await requestDirectoryAccess();
    expect(result).toBeNull();
  });

  it('should verify directory permissions', async () => {
    const mockHandle = {
      queryPermission: vi.fn().mockResolvedValue('granted'),
      requestPermission: vi.fn()
    } as any;

    const result = await verifyDirectoryPermission(mockHandle);
    expect(result).toBe(true);
    expect(mockHandle.queryPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
  });
});
```

## Acceptance Tests

Create `scripts/verify-directory-access.py`:
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

def check_no_client_directive(filepath):
    """Check that file does NOT have 'use client' directive"""
    with open(filepath, 'r') as f:
        first_line = f.readline().strip()
        if first_line == "'use client';":
            print(f"❌ {filepath} should NOT have 'use client' directive")
            return False
    print(f"✅ {filepath} correctly has no 'use client' directive")
    return True

def check_imports(filepath, required_imports):
    """Check that file has required imports"""
    with open(filepath, 'r') as f:
        content = f.read()
        missing = []
        for imp in required_imports:
            if imp not in content:
                missing.append(imp)
        
        if missing:
            print(f"❌ {filepath} missing imports: {', '.join(missing)}")
            return False
    
    print(f"✅ {filepath} has all required imports")
    return True

def run_tests():
    """Run filesystem tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/fs/browser-fs.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ File system tests pass")
        return True
    
    print(f"❌ Tests failed")
    return False

def main():
    checks = [
        # Check files exist
        check_file_exists('lib/state/filesystem.store.ts'),
        check_file_exists('lib/fs/browser-fs.ts'),
        check_file_exists('components/directory-selector.tsx'),
        check_file_exists('app/page.tsx'),
        check_file_exists('app/page.module.css'),
        check_file_exists('lib/fs/browser-fs.test.ts'),
        
        # Check 'use client' directives - only where needed!
        check_client_directive('lib/state/filesystem.store.ts'),
        check_client_directive('lib/fs/browser-fs.ts'),
        check_client_directive('components/directory-selector.tsx'),
        check_no_client_directive('app/page.tsx'),  # Should NOT have 'use client'
        
        # Check key imports
        check_imports('components/directory-selector.tsx', [
            'useFileSystemStore',
            'requestDirectoryAccess',
            'verifyDirectoryPermission'
        ]),
        
        # Run tests
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Directory access implementation complete!")
        print("Users can now select and grant permission to local directories.")
        sys.exit(0)
    else:
        print("\n❌ Directory access implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Success Criteria
- [ ] User can click button to select directory
- [ ] Browser permission dialog appears
- [ ] Selected directory name is displayed
- [ ] Directory handle is stored in Zustand state
- [ ] User can change/clear directory selection
- [ ] Components using FS API have 'use client' directive
- [ ] app/page.tsx does NOT have 'use client' directive
- [ ] Tests pass for error handling
- [ ] All files in correct locations (no src/ directory)