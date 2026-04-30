import { renderTwigToHtml } from '../highlight/createHighlighter';
import { normalizeOptions } from '../options';
import type { TwigAddonOptions } from '../types';

const PATCHED_ATTRIBUTE = 'data-storybook-addon-twig-patched';

type OriginalPreState = {
  className: string;
  html: string;
  style: string | null;
};

const originalPreState = new WeakMap<HTMLElement, OriginalPreState>();

export function installTwigCodeBlockPatch(options: TwigAddonOptions | undefined): () => void {
  const normalizedOptions = normalizeOptions(options);
  let disposed = false;

  if (!normalizedOptions.patchDocsCodeBlocks || typeof document === 'undefined') {
    return () => undefined;
  }

  const observer = new MutationObserver(() => {
    void patchExistingCodeBlocks(normalizedOptions, () => disposed);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  void patchExistingCodeBlocks(normalizedOptions, () => disposed);

  return () => {
    disposed = true;
    observer.disconnect();
    document.querySelectorAll<HTMLElement>(`[${PATCHED_ATTRIBUTE}]`).forEach((node) => {
      restorePreNode(node);
      node.removeAttribute(PATCHED_ATTRIBUTE);
    });
  };
}

async function patchExistingCodeBlocks(
  options: ReturnType<typeof normalizeOptions>,
  isDisposed: () => boolean,
): Promise<void> {
  const preNodes = collectTwigPreNodes();

  await Promise.all(
    Array.from(preNodes).map(async (pre) => {
      if (isDisposed() || pre.hasAttribute(PATCHED_ATTRIBUTE)) {
        return;
      }

      pre.setAttribute(PATCHED_ATTRIBUTE, 'true');
      try {
        const code = getVisiblePreText(pre);
        const html = await renderTwigToHtml(code, options);
        const renderedPre = getRenderedPreNode(html);

        if (isDisposed()) {
          pre.removeAttribute(PATCHED_ATTRIBUTE);
          return;
        }

        patchPreNode(pre, renderedPre);
        /* v8 ignore start -- Defensive recovery if highlighting unexpectedly fails. */
      } catch {
        pre.removeAttribute(PATCHED_ATTRIBUTE);
      }
      /* v8 ignore stop */
    }),
  );
}

function collectTwigPreNodes(): Set<HTMLElement> {
  const preNodes = new Set<HTMLElement>();
  const codeNodes = document.querySelectorAll<HTMLElement>(
    [
      'pre code.language-twig',
      'pre code.language-html\\.twig',
      'pre code.language-html-twig',
      'pre code[class*="language-twig"]',
    ].join(','),
  );

  codeNodes.forEach((codeNode) => {
    preNodes.add(codeNode.closest('pre') as HTMLElement);
  });

  document.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
    const code = getVisiblePreText(pre);
    if (shouldPatchPreNode(pre, code)) {
      preNodes.add(pre);
    }
  });

  return preNodes;
}

function shouldPatchPreNode(pre: HTMLElement, code: string): boolean {
  return (
    pre.classList.contains('prismjs') &&
    !pre.classList.contains('sb-errordisplay_code') &&
    !pre.classList.contains('satw-code') &&
    containsTwigSyntax(code)
  );
}

function containsTwigSyntax(code: string): boolean {
  return code.includes('{%') || code.includes('{{') || code.includes('{#');
}

function getVisiblePreText(pre: HTMLElement): string {
  return pre.innerText || pre.textContent || '';
}

function getRenderedPreNode(html: string): HTMLPreElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const renderedPre = template.content.querySelector('pre');

  if (!renderedPre) {
    throw new Error('Twig highlighter did not render a pre element.');
  }

  return renderedPre;
}

function patchPreNode(pre: HTMLElement, renderedPre: HTMLPreElement): void {
  originalPreState.set(pre, {
    className: pre.className,
    html: pre.innerHTML,
    style: pre.getAttribute('style'),
  });

  renderedPre.classList.forEach((className) => pre.classList.add(className));
  pre.classList.add('satw-code--docs');
  pre.style.background = 'transparent';
  pre.innerHTML = renderedPre.innerHTML;
}

function restorePreNode(pre: HTMLElement): void {
  const original = originalPreState.get(pre);

  if (!original) {
    return;
  }

  pre.className = original.className;
  pre.innerHTML = original.html;

  if (original.style) {
    pre.setAttribute('style', original.style);
  } else {
    pre.removeAttribute('style');
  }

  originalPreState.delete(pre);
}
