// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OPTIONS_GLOBAL } from './constants';

const installTwigCodeBlockPatchMock = vi.hoisted(() => vi.fn(() => vi.fn()));
const installAddonStylesMock = vi.hoisted(() => vi.fn());

vi.mock('./runtime/patchCodeBlocks', () => ({
  installTwigCodeBlockPatch: installTwigCodeBlockPatchMock,
}));

vi.mock('./styles', () => ({
  installAddonStyles: installAddonStylesMock,
}));

describe('preview entry', () => {
  beforeEach(() => {
    vi.resetModules();
    installTwigCodeBlockPatchMock.mockClear();
    installAddonStylesMock.mockClear();
    window.__STORYBOOK_ADDON_TWIG_CLEANUP__ = vi.fn();
    window[OPTIONS_GLOBAL] = {
      patchDocsCodeBlocks: false,
      theme: 'github-light',
    };
  });

  it('installs styles, cleans up previous patches, and registers the current cleanup', async () => {
    const previousCleanup = window.__STORYBOOK_ADDON_TWIG_CLEANUP__;
    const cleanup = vi.fn();
    installTwigCodeBlockPatchMock.mockReturnValueOnce(cleanup);

    const preview = await import('./preview');

    expect(installAddonStylesMock).toHaveBeenCalledWith(document);
    expect(previousCleanup).toHaveBeenCalled();
    expect(installTwigCodeBlockPatchMock).toHaveBeenCalledWith({
      patchDocsCodeBlocks: false,
      theme: 'github-light',
    });
    expect(window.__STORYBOOK_ADDON_TWIG_CLEANUP__).toBe(cleanup);
    expect(preview.decorators).toEqual([]);
  });
});
