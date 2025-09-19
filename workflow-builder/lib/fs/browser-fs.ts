'use client';

import './types';

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
