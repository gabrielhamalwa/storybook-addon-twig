import { OPTIONS_GLOBAL } from './constants';
import { installTwigCodeBlockPatch } from './runtime/patchCodeBlocks';
import { installAddonStyles } from './styles';

if (typeof window !== 'undefined') {
  installAddonStyles(document);
  window.__STORYBOOK_ADDON_TWIG_CLEANUP__?.();
  window.__STORYBOOK_ADDON_TWIG_CLEANUP__ = installTwigCodeBlockPatch(window[OPTIONS_GLOBAL]);
}

export const decorators = [];
