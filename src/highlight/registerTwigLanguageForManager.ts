import { SyntaxHighlighter } from 'storybook/internal/components';

import { refractorTwig } from './refractorTwig';
import { TWIG_LANGUAGE_ALIASES } from './twigLanguage';

let registered = false;

export function registerTwigLanguageForManager(): void {
  if (registered) {
    return;
  }

  for (const alias of TWIG_LANGUAGE_ALIASES) {
    SyntaxHighlighter.registerLanguage(alias, refractorTwig);
  }

  registered = true;
}
