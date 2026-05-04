import { refractor } from 'refractor';
import type { ElementContent, RootContent } from 'hast';
import type { Syntax } from 'refractor';

import { OPTIONS_GLOBAL } from '../constants';
import { refractorTwig } from '../highlight/refractorTwig';
import { TWIG_LANGUAGE_ALIASES } from '../highlight/twigLanguage';
import { normalizeOptions } from '../options';
import type { NormalizedTwigAddonOptions, TwigAddonOptions } from '../types';

declare global {
  interface Window {
    __STORYBOOK_ADDON_TWIG_DOCS_INITIALIZED__?: boolean;
    [OPTIONS_GLOBAL]?: TwigAddonOptions;
  }
}

const TWIG_DOCS_LANGUAGES = new Set([...TWIG_LANGUAGE_ALIASES, 'html+twig']);
const PRE_SELECTOR = 'pre.prismjs:not([data-twig-patched]):not([data-twig-original])';

let languagesRegistered = false;
let domObserver: MutationObserver | undefined;
let contentObservers: MutationObserver[] = [];
let patchedElements = new WeakSet<HTMLElement>();
let originalToPatched = new WeakMap<HTMLElement, HTMLElement>();
let scheduledFrame = 0;

function getOptions(rawOptions?: TwigAddonOptions): NormalizedTwigAddonOptions {
  const globalOptions = typeof window !== 'undefined' ? window[OPTIONS_GLOBAL] : undefined;
  return normalizeOptions(rawOptions ?? globalOptions);
}

function registerTwigLanguage(): void {
  if (languagesRegistered) {
    return;
  }

  if (!refractor.registered('twig')) {
    refractor.register(refractorTwig as unknown as Syntax);
  }

  refractor.alias('twig', [...TWIG_LANGUAGE_ALIASES, 'html+twig']);
  languagesRegistered = true;
}

function extractLanguage(className?: string): string | undefined {
  if (!className) {
    return undefined;
  }

  for (const token of className.split(/\s+/)) {
    if (token.startsWith('language-')) {
      return token.slice('language-'.length);
    }

    if (token.startsWith('lang-')) {
      return token.slice('lang-'.length);
    }
  }

  return undefined;
}

function isTwigLanguage(language?: string): boolean {
  return typeof language === 'string' && TWIG_DOCS_LANGUAGES.has(language);
}

function extractCodeElement(pre: HTMLElement): HTMLElement | null {
  const candidate = pre.querySelector<HTMLElement>('[class*="language-"], [class*="lang-"]');
  return candidate instanceof HTMLElement ? candidate : null;
}

function createDomNode(node: RootContent | ElementContent): Node {
  if (node.type === 'text') {
    return document.createTextNode(node.value);
  }

  if (node.type !== 'element') {
    return document.createTextNode('');
  }

  const element = document.createElement(node.tagName);
  const properties = node.properties ?? {};

  for (const [key, value] of Object.entries(properties)) {
    if (value == null) {
      continue;
    }

    if (key === 'className' && Array.isArray(value)) {
      element.className = value.join(' ');
      continue;
    }

    if (typeof value === 'boolean') {
      if (value) {
        element.setAttribute(key, '');
      }
      continue;
    }

    if (Array.isArray(value)) {
      element.setAttribute(key, value.join(' '));
      continue;
    }

    element.setAttribute(key, String(value));
  }

  for (const child of node.children ?? []) {
    element.appendChild(createDomNode(child));
  }

  return element;
}

function applyWrapBehavior(element: HTMLElement, options: NormalizedTwigAddonOptions): void {
  element.style.whiteSpace = options.wrapLines ? 'pre-wrap' : 'pre';
  element.style.overflowWrap = options.wrapLines ? 'anywhere' : 'normal';
}

function createPatchedPre(
  originalPre: HTMLElement,
  originalCodeElement: HTMLElement,
  options: NormalizedTwigAddonOptions,
): HTMLElement | null {
  const code = originalCodeElement.textContent ?? '';

  if (!code.trim()) {
    return null;
  }

  const highlighted = refractor.highlight(code, 'twig');
  const patchedPre = originalPre.cloneNode(false) as HTMLElement;
  const patchedCodeElement = originalCodeElement.cloneNode(false) as HTMLElement;
  const fragment = document.createDocumentFragment();

  patchedPre.setAttribute('data-twig-patched', 'true');
  patchedPre.setAttribute('data-twig-source', code);
  patchedCodeElement.replaceChildren();

  for (const child of highlighted.children) {
    fragment.appendChild(createDomNode(child));
  }

  applyWrapBehavior(patchedCodeElement, options);
  patchedCodeElement.appendChild(fragment);
  patchedPre.appendChild(patchedCodeElement);

  return patchedPre;
}

function disconnectContentObservers(): void {
  for (const observer of contentObservers) {
    observer.disconnect();
  }
  contentObservers = [];
}

function cleanupPatchedElement(originalPre: HTMLElement): void {
  const patchedPre = originalToPatched.get(originalPre);

  if (patchedPre?.parentNode) {
    patchedPre.parentNode.removeChild(patchedPre);
  }

  originalToPatched.delete(originalPre);
  patchedElements.delete(originalPre);
  originalPre.removeAttribute('data-twig-original');
  originalPre.style.removeProperty('display');
}

function updatePatchedElement(originalPre: HTMLElement, options: NormalizedTwigAddonOptions): void {
  const originalCodeElement = extractCodeElement(originalPre);

  if (!originalCodeElement) {
    return;
  }

  const patchedPre = createPatchedPre(originalPre, originalCodeElement, options);
  const currentPatchedPre = originalToPatched.get(originalPre);

  if (!patchedPre || !currentPatchedPre?.parentNode) {
    return;
  }

  currentPatchedPre.parentNode.replaceChild(patchedPre, currentPatchedPre);
  originalToPatched.set(originalPre, patchedPre);
}

async function patchCodeBlock(originalPre: HTMLElement, options = getOptions()): Promise<void> {
  if (patchedElements.has(originalPre) || !options.docsCodeBlocks) {
    return;
  }

  const originalCodeElement = extractCodeElement(originalPre);
  const language = extractLanguage(originalCodeElement?.className);

  if (!originalCodeElement || !isTwigLanguage(language)) {
    return;
  }

  registerTwigLanguage();

  const patchedPre = createPatchedPre(originalPre, originalCodeElement, options);

  if (!patchedPre || !originalPre.parentNode) {
    return;
  }

  patchedElements.add(originalPre);
  originalPre.style.display = 'none';
  originalPre.setAttribute('data-twig-original', 'true');
  originalPre.parentNode.insertBefore(patchedPre, originalPre.nextSibling);
  originalToPatched.set(originalPre, patchedPre);

  const contentObserver = new MutationObserver(() => {
    updatePatchedElement(originalPre, options);
  });

  contentObserver.observe(originalPre, {
    characterData: true,
    childList: true,
    subtree: true,
  });

  contentObservers.push(contentObserver);
}

export async function scanAndPatch(root: Document | HTMLElement = document): Promise<void> {
  const options = getOptions();

  if (!options.docsCodeBlocks || typeof document === 'undefined') {
    return;
  }

  const candidates = root.querySelectorAll<HTMLElement>(PRE_SELECTOR);

  for (const candidate of Array.from(candidates)) {
    await patchCodeBlock(candidate, options);
  }
}

function observeDOM(): void {
  const options = getOptions();

  if (domObserver || !options.docsCodeBlocks) {
    return;
  }

  domObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.removedNodes)) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }

        if (node.matches?.('[data-twig-original]')) {
          cleanupPatchedElement(node);
        }

        for (const originalPre of Array.from(node.querySelectorAll<HTMLElement>('[data-twig-original]'))) {
          cleanupPatchedElement(originalPre);
        }
      }

      for (const node of Array.from(mutation.addedNodes)) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }

        if (node.matches?.(PRE_SELECTOR)) {
          void patchCodeBlock(node, options);
        }

        for (const descendant of Array.from(node.querySelectorAll<HTMLElement>(PRE_SELECTOR))) {
          void patchCodeBlock(descendant, options);
        }
      }
    }
  });

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function init(): void {
  const options = getOptions();

  if (!options.docsCodeBlocks) {
    return;
  }

  const scheduleScan = () => {
    if (scheduledFrame !== 0) {
      return;
    }

    scheduledFrame = window.requestAnimationFrame(() => {
      scheduledFrame = 0;
      void scanAndPatch();
    });
  };

  scheduleScan();
  window.setTimeout(scheduleScan, 100);
  window.setTimeout(scheduleScan, 1000);
  observeDOM();
}

export function resetTwigDocsCodeBlockPatcherForTests(): void {
  domObserver?.disconnect();
  domObserver = undefined;
  disconnectContentObservers();
  patchedElements = new WeakSet<HTMLElement>();
  originalToPatched = new WeakMap<HTMLElement, HTMLElement>();
  languagesRegistered = false;

  if (typeof window !== 'undefined' && scheduledFrame !== 0) {
    window.cancelAnimationFrame(scheduledFrame);
  }

  scheduledFrame = 0;

  if (typeof document !== 'undefined') {
    for (const originalPre of Array.from(document.querySelectorAll<HTMLElement>('[data-twig-original]'))) {
      originalPre.style.removeProperty('display');
      originalPre.removeAttribute('data-twig-original');
    }

    for (const patchedPre of Array.from(document.querySelectorAll<HTMLElement>('[data-twig-patched]'))) {
      patchedPre.remove();
    }
  }

  if (typeof window !== 'undefined') {
    delete window.__STORYBOOK_ADDON_TWIG_DOCS_INITIALIZED__;
  }
}

export function startTwigDocsCodeBlockPatcher(): void {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  if (!isBrowser || window.__STORYBOOK_ADDON_TWIG_DOCS_INITIALIZED__) {
    return;
  }

  window.__STORYBOOK_ADDON_TWIG_DOCS_INITIALIZED__ = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
    return;
  }

  init();
}

startTwigDocsCodeBlockPatcher();

export { patchCodeBlock };

export const __internal = {
  cleanupPatchedElement,
  createDomNode,
  createPatchedPre,
  extractCodeElement,
  extractLanguage,
  getOptions,
  init,
  isTwigLanguage,
  observeDOM,
  registerTwigLanguage,
  updatePatchedElement,
};
