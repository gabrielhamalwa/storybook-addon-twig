import { renderTwigToHtml } from '../highlight/createHighlighter';
import { normalizeOptions } from '../options';
import type { TwigAddonOptions } from '../types';

const PATCHED_ATTRIBUTE = 'data-storybook-addon-twig-patched';
const REPLACEMENT_ATTRIBUTE = 'data-storybook-addon-twig-replacement';

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
    document.querySelectorAll(`[${REPLACEMENT_ATTRIBUTE}]`).forEach((node) => node.remove());
    document.querySelectorAll<HTMLElement>(`[${PATCHED_ATTRIBUTE}]`).forEach((node) => {
      node.style.display = '';
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
        const replacement = document.createElement('div');
        replacement.setAttribute(REPLACEMENT_ATTRIBUTE, 'true');
        replacement.className = 'satw-code-block';
        replacement.innerHTML = html;

        if (isDisposed()) {
          pre.removeAttribute(PATCHED_ATTRIBUTE);
          return;
        }

        pre.style.display = 'none';
        pre.insertAdjacentElement('afterend', replacement);
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
    !pre.closest(`[${REPLACEMENT_ATTRIBUTE}]`) &&
    containsTwigSyntax(code)
  );
}

function containsTwigSyntax(code: string): boolean {
  return code.includes('{%') || code.includes('{{') || code.includes('{#');
}

function getVisiblePreText(pre: HTMLElement): string {
  return pre.innerText || pre.textContent || '';
}
