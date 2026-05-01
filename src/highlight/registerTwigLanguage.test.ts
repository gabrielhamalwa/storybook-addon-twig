import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('registerTwigLanguage', () => {
  beforeEach(() => {
    vi.resetModules();
    delete (globalThis as { Prism?: unknown }).Prism;
  });

  it('registers Twig and aliases on the active Prism runtime', async () => {
    const hooks = {
      add: vi.fn(),
    };
    (globalThis as { Prism?: unknown }).Prism = {
      languages: {},
      hooks,
    };

    const { registerTwigLanguage } = await import('./registerTwigLanguage');

    registerTwigLanguage();

    const prism = (globalThis as { Prism?: { languages: Record<string, unknown> } }).Prism;
    expect(prism?.languages.twig).toBeDefined();
    expect(prism?.languages['html.twig']).toBe(prism?.languages.twig);
    expect(prism?.languages['html-twig']).toBe(prism?.languages.twig);
    expect(hooks.add).toHaveBeenCalledTimes(2);
  });

  it('registers the grammar once per module instance', async () => {
    const hooks = {
      add: vi.fn(),
    };
    (globalThis as { Prism?: unknown }).Prism = {
      languages: {},
      hooks,
    };

    const { registerTwigLanguage } = await import('./registerTwigLanguage');

    registerTwigLanguage();
    registerTwigLanguage();

    expect(hooks.add).toHaveBeenCalledTimes(2);
  });

  it('is a no-op when Prism is unavailable', async () => {
    const { registerTwigLanguage } = await import('./registerTwigLanguage');

    expect(() => registerTwigLanguage()).not.toThrow();
  });

  it('is a no-op when Prism has no languages container', async () => {
    (globalThis as { Prism?: unknown }).Prism = {};
    const { registerTwigLanguage } = await import('./registerTwigLanguage');

    expect(() => registerTwigLanguage()).not.toThrow();
  });

  it('reuses an existing twig language definition', async () => {
    const existingTwig = { token: 'existing' };
    const hooks = {
      add: vi.fn(),
    };
    (globalThis as { Prism?: unknown }).Prism = {
      languages: {
        twig: existingTwig,
      },
      hooks,
    };
    const { registerTwigLanguage } = await import('./registerTwigLanguage');

    registerTwigLanguage();

    const prism = (globalThis as { Prism?: { languages: Record<string, unknown> } }).Prism;
    expect(prism?.languages.twig).toBe(existingTwig);
    expect(prism?.languages['html.twig']).toBe(existingTwig);
    expect(prism?.languages['html-twig']).toBe(existingTwig);
    expect(hooks.add).not.toHaveBeenCalled();
  });
});
