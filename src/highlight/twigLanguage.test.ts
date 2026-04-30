import { describe, expect, it } from 'vitest';

import { TWIG_LANGUAGE_ALIASES } from './twigLanguage';

describe('TWIG_LANGUAGE_ALIASES', () => {
  it('contains Markdown and Storybook class aliases', () => {
    expect(TWIG_LANGUAGE_ALIASES).toEqual(['twig', 'html.twig', 'html-twig']);
  });
});
