// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerTwigLanguageMock = vi.hoisted(() => vi.fn());

vi.mock('./highlight/registerTwigLanguage', () => ({
  registerTwigLanguage: registerTwigLanguageMock,
}));

describe('preview entry without browser globals', () => {
  beforeEach(() => {
    vi.resetModules();
    registerTwigLanguageMock.mockClear();
  });

  it('can be imported for metadata without touching browser-only Storybook APIs', async () => {
    const preview = await import('./preview');

    expect(preview.decorators).toEqual([]);
    expect(registerTwigLanguageMock).not.toHaveBeenCalled();
  });
});
