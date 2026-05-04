// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('preview entry without browser globals', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('can be imported for metadata without touching browser-only runtime patchers', async () => {
    const preview = await import('./preview');

    expect(preview.decorators).toEqual([]);
    expect(preview.parameters).toEqual({});
  }, 15000);
});
