// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OPTIONS_GLOBAL } from '../constants';
import {
  __internal,
  patchCodeBlock,
  resetTwigDocsCodeBlockPatcherForTests,
  scanAndPatch,
  startTwigDocsCodeBlockPatcher,
} from './patchDocsCodeBlocks';

function createTwigPre(
  language = 'twig',
  code = "{% set label = 'Save' %}\n<h1>{{ label }}</h1>",
): { pre: HTMLElement; codeElement: HTMLElement } {
  const pre = document.createElement('pre');
  pre.className = 'prismjs css-4zr3vl';

  const codeElement = document.createElement('div');
  codeElement.className = `language-${language} css-zye6j`;
  codeElement.style.whiteSpace = 'pre';
  codeElement.textContent = code;

  pre.appendChild(codeElement);
  document.body.appendChild(pre);

  return { pre, codeElement };
}

describe('patchDocsCodeBlocks runtime patcher', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '<head></head><body></body>';
    window[OPTIONS_GLOBAL] = { docsCodeBlocks: true, wrapLines: true };
    resetTwigDocsCodeBlockPatcherForTests();
    vi.restoreAllMocks();
  });

  it('replaces a twig docs block with a patched sibling and hides the original', async () => {
    const { pre } = createTwigPre();

    await patchCodeBlock(pre);

    expect(pre.getAttribute('data-twig-original')).toBe('true');
    expect(pre.style.display).toBe('none');

    const patched = pre.nextElementSibling as HTMLElement | null;
    expect(patched?.getAttribute('data-twig-patched')).toBe('true');
    expect(patched?.querySelector('.token.keyword')?.textContent).toBe('set');
  });

  it('reads options from explicit input or window globals', () => {
    window[OPTIONS_GLOBAL] = { docsCodeBlocks: false, wrapLines: false };

    expect(__internal.getOptions().docsCodeBlocks).toBe(false);
    expect(__internal.getOptions({ docsCodeBlocks: true }).docsCodeBlocks).toBe(true);
  });

  it('extracts twig-like languages from Storybook class names', () => {
    expect(__internal.extractLanguage(undefined)).toBeUndefined();
    expect(__internal.extractLanguage('language-twig css-zye6j')).toBe('twig');
    expect(__internal.extractLanguage('lang-html.twig other')).toBe('html.twig');
    expect(__internal.extractLanguage('css-zye6j only')).toBeUndefined();
    expect(__internal.isTwigLanguage('twig')).toBe(true);
    expect(__internal.isTwigLanguage('html+twig')).toBe(true);
    expect(__internal.isTwigLanguage('ts')).toBe(false);
  });

  it('finds the language element inside a Storybook docs pre wrapper', () => {
    const { pre, codeElement } = createTwigPre();

    expect(__internal.extractCodeElement(pre)).toBe(codeElement);
    expect(__internal.extractCodeElement(document.createElement('pre'))).toBeNull();
  });

  it('creates DOM nodes for text, generic, and element refractor output', () => {
    const textNode = __internal.createDomNode({ type: 'text', value: 'twig' });
    const genericNode = __internal.createDomNode({ type: 'comment', value: 'ignored' } as never);
    const elementNode = __internal.createDomNode({
      type: 'element',
      tagName: 'span',
      properties: {
        className: ['token', 'keyword'],
        hidden: true,
        inert: false,
        dataAttrs: ['one', 'two'],
        title: 'Twig',
        nullable: null,
      },
      children: [{ type: 'text', value: 'set' }],
    });

    expect(textNode.textContent).toBe('twig');
    expect(genericNode.textContent).toBe('');
    expect((elementNode as HTMLElement).className).toBe('token keyword');
    expect((elementNode as HTMLElement).getAttribute('hidden')).toBe('');
    expect((elementNode as HTMLElement).hasAttribute('inert')).toBe(false);
    expect((elementNode as HTMLElement).getAttribute('dataAttrs')).toBe('one two');
    expect((elementNode as HTMLElement).getAttribute('title')).toBe('Twig');
    expect(elementNode.textContent).toBe('set');
  });

  it('handles element nodes without properties or children', () => {
    const bareElement = __internal.createDomNode({
      type: 'element',
      tagName: 'span',
    } as never);

    expect((bareElement as HTMLElement).tagName).toBe('SPAN');
    expect(bareElement.textContent).toBe('');
  });

  it('supports twig aliases and preserves full explicit Source text', async () => {
    const source = "{% include 'button.twig' with {\nlabel: 'From Source block',\nvariant: 'secondary'\n} %}";
    const { pre } = createTwigPre('html.twig', source);

    await patchCodeBlock(pre);

    const patched = pre.nextElementSibling as HTMLElement | null;
    expect(patched?.getAttribute('data-twig-source')).toBe(source);
    expect(patched?.textContent).toContain("{% include 'button.twig' with {");
    expect(patched?.querySelector('.token.tag-name.keyword')?.textContent).toBe('include');
  });

  it('patches twig blocks through scanAndPatch', async () => {
    const { pre } = createTwigPre();

    await scanAndPatch();

    expect(pre.nextElementSibling?.getAttribute('data-twig-patched')).toBe('true');
  });

  it('returns null when asked to build a patched pre for empty code text', () => {
    const { pre } = createTwigPre();
    const emptyCodeElement = document.createElement('div');
    emptyCodeElement.className = 'language-twig';
    Object.defineProperty(emptyCodeElement, 'textContent', {
      configurable: true,
      get: () => null,
    });

    expect(__internal.createPatchedPre(pre, emptyCodeElement, __internal.getOptions())).toBeNull();
  });

  it('applies non-wrapping styles when wrapLines is disabled', () => {
    const { pre, codeElement } = createTwigPre();
    const patched = __internal.createPatchedPre(pre, codeElement, __internal.getOptions({ wrapLines: false }));

    const patchedCodeElement = patched?.querySelector('[class*="language-"]') as HTMLElement | null;
    expect(patchedCodeElement?.style.whiteSpace).toBe('pre');
    expect(patchedCodeElement?.style.overflowWrap).toBe('normal');
  });

  it('leaves non-twig blocks alone', async () => {
    const { pre } = createTwigPre('ts', 'const answer = 42;');

    await patchCodeBlock(pre);

    expect(pre.getAttribute('data-twig-original')).toBeNull();
    expect(pre.nextElementSibling?.getAttribute('data-twig-patched')).not.toBe('true');
  });

  it('does not patch empty or detached twig blocks', async () => {
    const empty = createTwigPre('twig', '   ');
    await patchCodeBlock(empty.pre);
    expect(empty.pre.nextElementSibling?.getAttribute('data-twig-patched')).not.toBe('true');

    const detached = document.createElement('pre');
    detached.className = 'prismjs';
    const detachedCode = document.createElement('div');
    detachedCode.className = 'language-twig';
    detachedCode.textContent = '{{ label }}';
    detached.appendChild(detachedCode);

    await patchCodeBlock(detached);
    expect(detached.getAttribute('data-twig-original')).toBeNull();
  });

  it('returns early when no language element exists', async () => {
    const pre = document.createElement('pre');
    pre.className = 'prismjs';
    pre.textContent = '{{ label }}';
    document.body.appendChild(pre);

    await patchCodeBlock(pre);

    expect(pre.getAttribute('data-twig-original')).toBeNull();
  });

  it('respects docsCodeBlocks=false', async () => {
    window[OPTIONS_GLOBAL] = { docsCodeBlocks: false };
    const { pre } = createTwigPre();

    await scanAndPatch();

    expect(pre.getAttribute('data-twig-original')).toBeNull();
    expect(pre.nextElementSibling?.getAttribute('data-twig-patched')).not.toBe('true');
  });

  it('skips blocks that are already patched', async () => {
    const { pre } = createTwigPre();

    await patchCodeBlock(pre);
    const patched = pre.nextElementSibling;

    await patchCodeBlock(pre);

    expect(pre.nextElementSibling).toBe(patched);
  });

  it('updates the patched copy when the original source changes', async () => {
    const { pre, codeElement } = createTwigPre();

    await patchCodeBlock(pre);

    codeElement.textContent = "{% if enabled %}\n  <strong>{{ label }}</strong>\n{% endif %}";

    await vi.waitFor(() => {
      const patched = pre.nextElementSibling as HTMLElement | null;
      expect(patched?.textContent).toContain('{% if enabled %}');
      expect(patched?.querySelector('.token.tag-name.keyword')?.textContent).toBe('if');
    });
  });

  it('handles update and cleanup no-op branches safely', async () => {
    const { pre } = createTwigPre();

    __internal.updatePatchedElement(pre, __internal.getOptions());
    __internal.cleanupPatchedElement(pre);

    expect(pre.getAttribute('data-twig-original')).toBeNull();
  });

  it('returns early when update runs without a code element', () => {
    const pre = document.createElement('pre');
    pre.className = 'prismjs';
    document.body.appendChild(pre);

    __internal.updatePatchedElement(pre, __internal.getOptions());

    expect(pre.getAttribute('data-twig-original')).toBeNull();
  });

  it('returns early when update has no existing patched sibling', () => {
    const { pre } = createTwigPre();

    __internal.updatePatchedElement(pre, __internal.getOptions());

    expect(pre.nextElementSibling?.getAttribute('data-twig-patched')).not.toBe('true');
  });

  it('patches added nodes through the DOM observer and cleans up removed nodes', async () => {
    startTwigDocsCodeBlockPatcher();

    const { pre } = createTwigPre();

    await vi.waitFor(() => {
      expect(pre.nextElementSibling?.getAttribute('data-twig-patched')).toBe('true');
    });

    const patched = pre.nextElementSibling as HTMLElement;
    pre.remove();

    await vi.waitFor(() => {
      expect(patched.isConnected).toBe(false);
    });
  });

  it('ignores non-element mutations and descendant cleanup works', async () => {
    startTwigDocsCodeBlockPatcher();

    const wrapper = document.createElement('div');
    document.body.appendChild(wrapper);

    const textNode = document.createTextNode('ignore');
    wrapper.appendChild(textNode);

    const { pre } = createTwigPre();
    wrapper.appendChild(pre);

    await vi.waitFor(() => {
      expect(pre.nextElementSibling?.getAttribute('data-twig-patched')).toBe('true');
    });

    wrapper.removeChild(textNode);
    wrapper.remove();

    await vi.waitFor(() => {
      expect(document.querySelector('[data-twig-patched]')).toBeNull();
    });
  });

  it('handles loading documents by waiting for DOMContentLoaded', async () => {
    const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const startSpy = vi.spyOn(document, 'addEventListener');
    startTwigDocsCodeBlockPatcher();

    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(startSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function), { once: true });

    readyState.mockRestore();
  });

  it('does not initialize twice', () => {
    startTwigDocsCodeBlockPatcher();
    const listenerSpy = vi.spyOn(document, 'addEventListener');

    startTwigDocsCodeBlockPatcher();

    expect(listenerSpy).not.toHaveBeenCalled();
  });

  it('does nothing when the boot options disable docs patching', () => {
    window[OPTIONS_GLOBAL] = { docsCodeBlocks: false };

    startTwigDocsCodeBlockPatcher();
    __internal.observeDOM();
    __internal.init();

    expect(document.querySelector('[data-twig-patched]')).toBeNull();
  });

  it('does not attach duplicate DOM observers', () => {
    __internal.observeDOM();
    __internal.observeDOM();

    const { pre } = createTwigPre();

    return vi.waitFor(() => {
      expect(pre.nextElementSibling?.getAttribute('data-twig-patched')).toBe('true');
    });
  });

  it('deduplicates scheduled scans while a frame is pending', () => {
    vi.useFakeTimers();
    const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);

    __internal.init();
    vi.advanceTimersByTime(1000);

    expect(frameSpy).toHaveBeenCalledTimes(1);

    frameSpy.mockRestore();
    readyState.mockRestore();
    vi.useRealTimers();
  });

  it('removes patched nodes during test reset', async () => {
    const { pre } = createTwigPre();

    await patchCodeBlock(pre);
    expect(document.querySelector('[data-twig-patched]')).not.toBeNull();

    resetTwigDocsCodeBlockPatcherForTests();

    expect(document.querySelector('[data-twig-patched]')).toBeNull();
    expect(pre.getAttribute('data-twig-original')).toBeNull();
    expect(pre.style.display).toBe('');
  });
});
