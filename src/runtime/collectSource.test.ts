import { describe, expect, it } from 'vitest';

import { collectTwigSource } from './collectSource';

describe('collectTwigSource', () => {
  it('returns configured source and file name', () => {
    expect(collectTwigSource({ fileName: 'button.html.twig', source: '{{ label }}' })).toEqual({
      code: '{{ label }}',
      fileName: 'button.html.twig',
    });
  });

  it('ignores missing source', () => {
    expect(collectTwigSource(undefined)).toBeUndefined();
    expect(collectTwigSource({ fileName: 'button.html.twig' })).toBeUndefined();
  });

  it('keeps intentionally empty source blocks', () => {
    expect(collectTwigSource({ fileName: 'empty.twig', source: '' })).toEqual({
      code: '',
      fileName: 'empty.twig',
    });
  });
});
