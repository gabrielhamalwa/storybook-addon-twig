import { OPTIONS_GLOBAL } from './constants';
import { registerTwigLanguage } from './highlight/registerTwigLanguage';
import { normalizeOptions } from './options';

if (typeof window !== 'undefined') {
  const options = normalizeOptions(window[OPTIONS_GLOBAL]);

  if (options.docsCodeBlocks) {
    registerTwigLanguage();
  }
}

export const decorators = [];
