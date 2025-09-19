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
