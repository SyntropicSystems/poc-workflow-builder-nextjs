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
    const mockFile = {
      text: vi.fn().mockResolvedValue(mockContent)
    };
    const mockHandle = {
      name: 'test.flow.yaml',
      getFile: vi.fn().mockResolvedValue(mockFile)
    } as any;

    const content = await readFileContent(mockHandle);
    
    expect(content).toBe(mockContent);
  });
});
