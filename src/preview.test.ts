// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OPTIONS_GLOBAL } from './constants';

const registerTwigLanguageMock = vi.hoisted(() => vi.fn());

vi.mock('./highlight/registerTwigLanguage', () => ({
  registerTwigLanguage: registerTwigLanguageMock,
}));

describe('preview entry', () => {
  beforeEach(() => {
    vi.resetModules();
    registerTwigLanguageMock.mockClear();
    delete window[OPTIONS_GLOBAL];
  });

  it('registers the Twig language for Storybook Docs by default', async () => {
    const preview = await import('./preview');

    expect(registerTwigLanguageMock).toHaveBeenCalledTimes(1);
    expect(preview.decorators).toEqual([]);
  });

  it('does not register the Twig language when Docs support is disabled', async () => {
    window[OPTIONS_GLOBAL] = { docsCodeBlocks: false };

    await import('./preview');

    expect(registerTwigLanguageMock).not.toHaveBeenCalled();
  });

  it('ignores removed legacy options and keeps docs registration enabled', async () => {
    window[OPTIONS_GLOBAL] = { patchDocsCodeBlocks: false } as unknown as (typeof window)[typeof OPTIONS_GLOBAL];

    await import('./preview');

    expect(registerTwigLanguageMock).toHaveBeenCalledTimes(1);
  });
});
