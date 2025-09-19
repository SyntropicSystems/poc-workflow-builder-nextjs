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
