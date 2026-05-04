// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('patchDocsCodeBlocks runtime patcher in node', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exposes safe no-op helpers without browser globals', async () => {
    const runtime = await import('./patchDocsCodeBlocks');

    expect(runtime.__internal.getOptions().docsCodeBlocks).toBe(true);
    expect(runtime.__internal.extractLanguage('language-twig')).toBe('twig');
    expect(runtime.__internal.isTwigLanguage('twig')).toBe(true);

    await expect(runtime.scanAndPatch({ querySelectorAll: () => [] } as never)).resolves.toBeUndefined();
    expect(() => runtime.resetTwigDocsCodeBlockPatcherForTests()).not.toThrow();
    expect(() => runtime.startTwigDocsCodeBlockPatcher()).not.toThrow();
  }, 15000);
});
