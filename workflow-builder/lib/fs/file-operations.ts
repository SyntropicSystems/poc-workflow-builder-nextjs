'use client';

export async function writeWorkflowFile(
  fileHandle: FileSystemFileHandle,
  content: string
): Promise<void> {
  try {
    // Create a writable stream - modern browsers handle permissions automatically
    const writable = await fileHandle.createWritable();
    
    try {
      // Write the content
      await writable.write(content);
      // Close the stream to save
      await writable.close();
    } catch (error) {
      // If there's an error, abort the write
      await writable.abort();
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'NotAllowedError') {
      throw new Error('Write permission denied. Please grant permission to save files.');
    }
    throw new Error(
      `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function hasUnsavedChanges(
  fileHandle: FileSystemFileHandle,
  currentContent: string
): Promise<boolean> {
  try {
    const file = await fileHandle.getFile();
    const originalContent = await file.text();
    return originalContent !== currentContent;
  } catch {
    // If we can't read the file, assume there are changes
    return true;
  }
}

export async function getFileHandle(
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<FileSystemFileHandle> {
  try {
    return await directoryHandle.getFileHandle(fileName);
  } catch (error) {
    throw new Error(`Failed to get file handle for ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
