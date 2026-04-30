// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { installTwigCodeBlockPatch } from './patchCodeBlocks';

const renderTwigToHtmlMock = vi.hoisted(() => vi.fn());

vi.mock('../highlight/createHighlighter', () => ({
  renderTwigToHtml: renderTwigToHtmlMock,
}));

describe('installTwigCodeBlockPatch', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '<head></head><body></body>';
    renderTwigToHtmlMock.mockReset();
    renderTwigToHtmlMock.mockResolvedValue('<pre class="shiki satw-code"><code>{{ label }}</code></pre>');
  });

  it('does nothing when docs code block patching is disabled', () => {
    document.body.innerHTML = '<pre><code class="language-twig">{{ label }}</code></pre>';

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: false });

    expect(document.querySelector('pre')?.hasAttribute('data-storybook-addon-twig-patched')).toBe(false);
    cleanup();
  });

  it('patches Twig code blocks in place and restores the DOM on cleanup', async () => {
    document.body.innerHTML =
      '<pre class="prismjs" style="color: red"><code class="language-html.twig">{{ label }}</code></pre>';

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });

    await vi.waitFor(() => {
      expect(document.querySelector('pre')?.classList.contains('satw-code')).toBe(true);
    });

    expect(document.querySelector('pre')?.getAttribute('data-storybook-addon-twig-patched')).toBe('true');
    expect(document.querySelectorAll('pre')).toHaveLength(1);
    expect((document.querySelector('pre') as HTMLElement).style.background).toBe('transparent');
    expect(document.querySelector('pre')?.innerHTML).toContain('<code>{{ label }}</code>');

    cleanup();

    expect(document.querySelector('pre')?.hasAttribute('data-storybook-addon-twig-patched')).toBe(false);
    expect(document.querySelector('pre')?.className).toBe('prismjs');
    expect(document.querySelector('pre')?.getAttribute('style')).toBe('color: red');
    expect(document.querySelector('code')?.className).toBe('language-html.twig');
  });

  it('does not patch an already patched pre element twice', async () => {
    document.body.innerHTML =
      '<pre data-storybook-addon-twig-patched="true"><code class="language-twig">{{ label }}</code></pre>';

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });

    expect(renderTwigToHtmlMock).not.toHaveBeenCalled();
    cleanup();
  });

  it('handles missing code text as empty source', async () => {
    document.body.innerHTML = '<pre><code class="language-twig"></code></pre>';

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });

    await vi.waitFor(() => {
      expect(document.querySelector('pre')?.classList.contains('satw-code')).toBe(true);
    });

    cleanup();
  });

  it('patches Storybook pre-only code blocks when the source is clearly Twig', async () => {
    document.body.innerHTML = '<pre class="prismjs">{% include "button.twig" %}</pre><pre>const value = true;</pre>';

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });

    await vi.waitFor(() => {
      expect(document.querySelectorAll('[data-storybook-addon-twig-patched]')).toHaveLength(1);
    });

    expect(document.querySelectorAll('[data-storybook-addon-twig-patched]')).toHaveLength(1);
    cleanup();
  });

  it('patches Twig code blocks added after initialization', async () => {
    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });

    document.body.innerHTML = '<pre><code class="language-twig">{{ late }}</code></pre>';

    await vi.waitFor(() => {
      expect(document.querySelector('pre')?.classList.contains('satw-code')).toBe(true);
    });

    cleanup();
  });

  it('skips Storybook error and addon-rendered pre blocks', async () => {
    document.body.innerHTML = [
      '<pre class="sb-errordisplay_code">{% broken %}</pre>',
      '<pre class="satw-code">{% already rendered %}</pre>',
      '<pre class="prismjs">{# real twig #}</pre>',
    ].join('');

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });

    await vi.waitFor(() => {
      expect(document.querySelectorAll('[data-storybook-addon-twig-patched]')).toHaveLength(1);
    });

    cleanup();
  });

  it('does not change the DOM after cleanup wins a pending render', async () => {
    let resolveRender: (html: string) => void = () => undefined;
    renderTwigToHtmlMock.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveRender = resolve;
      }),
    );
    document.body.innerHTML = '<pre><code class="language-twig">{{ label }}</code></pre>';

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });
    cleanup();
    resolveRender('<pre class="shiki satw-code"><code>{{ label }}</code></pre>');

    await vi.waitFor(() => {
      expect(renderTwigToHtmlMock).toHaveBeenCalledTimes(1);
    });

    expect(document.querySelector('pre')?.hasAttribute('data-storybook-addon-twig-patched')).toBe(false);
    expect((document.querySelector('pre') as HTMLElement).style.display).toBe('');
  });

  it('recovers when the highlighter does not return a pre element', async () => {
    renderTwigToHtmlMock.mockResolvedValueOnce('<code>{{ label }}</code>');
    document.body.innerHTML = '<pre><code class="language-twig">{{ label }}</code></pre>';

    const cleanup = installTwigCodeBlockPatch({ patchDocsCodeBlocks: true });

    await vi.waitFor(() => {
      expect(renderTwigToHtmlMock).toHaveBeenCalledTimes(1);
    });

    expect(document.querySelector('pre')?.hasAttribute('data-storybook-addon-twig-patched')).toBe(false);

    cleanup();
  });
});
