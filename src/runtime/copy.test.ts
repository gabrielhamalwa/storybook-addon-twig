import { describe, expect, it, vi } from 'vitest';

import { copyText } from './copy';

describe('copyText', () => {
  it('writes to the provided clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(copyText('hello', { writeText }, undefined)).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('returns false when no clipboard is available', async () => {
    await expect(copyText('hello', undefined, undefined)).resolves.toBe(false);
  });

  it('falls back to selection copy when clipboard writes fail', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const textarea = {
      remove: vi.fn(),
      select: vi.fn(),
      setAttribute: vi.fn(),
      style: {},
      value: '',
    } as unknown as HTMLTextAreaElement;
    const documentRef = {
      body: {
        appendChild: vi.fn(),
      },
      createElement: vi.fn(() => textarea),
      execCommand: vi.fn(() => true),
    } as unknown as Document;

    await expect(copyText('hello', { writeText }, documentRef)).resolves.toBe(true);
    expect(textarea.value).toBe('hello');
    expect(textarea.select).toHaveBeenCalled();
    expect(documentRef.execCommand).toHaveBeenCalledWith('copy');
    expect(textarea.remove).toHaveBeenCalled();
  });

  it('returns false when all copy mechanisms fail', async () => {
    const textarea = {
      remove: vi.fn(),
      select: vi.fn(),
      setAttribute: vi.fn(),
      style: {},
      value: '',
    } as unknown as HTMLTextAreaElement;
    const documentRef = {
      body: {
        appendChild: vi.fn(),
      },
      createElement: vi.fn(() => textarea),
      execCommand: vi.fn(() => {
        throw new Error('denied');
      }),
    } as unknown as Document;

    await expect(copyText('hello', undefined, documentRef)).resolves.toBe(false);
    expect(textarea.remove).toHaveBeenCalled();
  });
});
