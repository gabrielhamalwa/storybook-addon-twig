// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const installTwigCodeBlockPatchMock = vi.hoisted(() => vi.fn());
const installAddonStylesMock = vi.hoisted(() => vi.fn());

vi.mock('./runtime/patchCodeBlocks', () => ({
  installTwigCodeBlockPatch: installTwigCodeBlockPatchMock,
}));

vi.mock('./styles', () => ({
  installAddonStyles: installAddonStylesMock,
}));

describe('preview entry without browser globals', () => {
  beforeEach(() => {
    vi.resetModules();
    installTwigCodeBlockPatchMock.mockClear();
    installAddonStylesMock.mockClear();
  });

  it('can be imported for metadata without installing browser patches', async () => {
    const preview = await import('./preview');

    expect(preview.decorators).toEqual([]);
    expect(installAddonStylesMock).not.toHaveBeenCalled();
    expect(installTwigCodeBlockPatchMock).not.toHaveBeenCalled();
  });
});
