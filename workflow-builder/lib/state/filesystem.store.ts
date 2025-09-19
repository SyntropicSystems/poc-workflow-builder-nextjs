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
