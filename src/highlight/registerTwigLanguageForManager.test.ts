import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerLanguageMock = vi.hoisted(() => vi.fn());

vi.mock('storybook/internal/components', () => ({
  SyntaxHighlighter: {
    registerLanguage: registerLanguageMock,
  },
}));

describe('registerTwigLanguageForManager', () => {
  beforeEach(() => {
    vi.resetModules();
    registerLanguageMock.mockClear();
  });

  it('registers twig aliases on manager SyntaxHighlighter', async () => {
    const { registerTwigLanguageForManager } = await import('./registerTwigLanguageForManager');

    registerTwigLanguageForManager();

    expect(registerLanguageMock).toHaveBeenCalledTimes(3);
    expect(registerLanguageMock).toHaveBeenNthCalledWith(1, 'twig', expect.any(Function));
    expect(registerLanguageMock).toHaveBeenNthCalledWith(2, 'html.twig', expect.any(Function));
    expect(registerLanguageMock).toHaveBeenNthCalledWith(3, 'html-twig', expect.any(Function));
  });

  it('registers only once per module instance', async () => {
    const { registerTwigLanguageForManager } = await import('./registerTwigLanguageForManager');

    registerTwigLanguageForManager();
    registerTwigLanguageForManager();

    expect(registerLanguageMock).toHaveBeenCalledTimes(3);
  });
});
