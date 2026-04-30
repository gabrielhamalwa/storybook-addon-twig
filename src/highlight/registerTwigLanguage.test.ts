import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerLanguageMock = vi.hoisted(() => vi.fn());

vi.mock('storybook/internal/components', () => ({
  SyntaxHighlighter: {
    registerLanguage: registerLanguageMock,
  },
}));

describe('registerTwigLanguage', () => {
  beforeEach(() => {
    vi.resetModules();
    registerLanguageMock.mockClear();
  });

  it('registers the Refractor Twig grammar with Storybook syntax highlighting', async () => {
    const { registerTwigLanguage } = await import('./registerTwigLanguage');

    registerTwigLanguage();

    expect(registerLanguageMock).toHaveBeenCalledWith(
      'twig',
      expect.objectContaining({
        aliases: [],
        displayName: 'twig',
      }),
    );
  });

  it('registers the grammar once per module instance', async () => {
    const { registerTwigLanguage } = await import('./registerTwigLanguage');

    registerTwigLanguage();
    registerTwigLanguage();

    expect(registerLanguageMock).toHaveBeenCalledTimes(1);
  });
});
