'use client';

import { create } from 'zustand';
import type { WorkflowFile } from '@/lib/fs/file-discovery';

interface FileInfo {
  handle: FileSystemFileHandle;
  path: string;
  name: string;
  lastModified?: number;
}

interface FileSystemState {
  directoryHandle: FileSystemDirectoryHandle | null;
  directoryName: string | null;
  workflowFiles: WorkflowFile[];
  selectedFile: WorkflowFile | null;
  selectedFileHandle: FileSystemFileHandle | null;
  fileContent: string | null;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  clearDirectory: () => void;
  setWorkflowFiles: (files: WorkflowFile[]) => void;
  selectFile: (file: WorkflowFile, content: string, handle?: FileSystemFileHandle) => void;
  clearSelection: () => void;
}

export const useFileSystemStore = create<FileSystemState>((set) => ({
  directoryHandle: null,
  directoryName: null,
  workflowFiles: [],
  selectedFile: null,
  selectedFileHandle: null,
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
    selectedFileHandle: null,
    fileContent: null
  }),
  setWorkflowFiles: (files) => set({ workflowFiles: files }),
  selectFile: (file, content, handle) => set({ 
    selectedFile: file,
    selectedFileHandle: handle || null,
    fileContent: content 
  }),
  clearSelection: () => set({ 
    selectedFile: null,
    selectedFileHandle: null,
    fileContent: null 
  })
}));
