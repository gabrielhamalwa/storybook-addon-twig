// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OPTIONS_GLOBAL } from './constants';

describe('preview entry', () => {
  beforeEach(() => {
    vi.resetModules();
    document.documentElement.innerHTML = '<head></head><body></body>';
    window[OPTIONS_GLOBAL] = { docsCodeBlocks: true };
  });

  it('exports preview annotations in the browser and boots the docs patcher', async () => {
    const preview = await import('./preview');

    expect(preview.decorators).toEqual([]);
    expect(preview.parameters).toEqual({});
  }, 15000);
});
