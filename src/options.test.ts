import { describe, expect, it } from 'vitest';

import { mergeSourceOptions, normalizeOptions } from './options';

describe('normalizeOptions', () => {
  it('uses stable defaults', () => {
    expect(normalizeOptions(undefined)).toMatchObject({
      copy: true,
      panel: true,
      patchDocsCodeBlocks: true,
      showLineNumbers: true,
      theme: 'github-dark',
      wrapLines: true,
    });
  });

  it('preserves explicit supported option overrides', () => {
    expect(
      normalizeOptions({
        copy: false,
        panel: false,
        patchDocsCodeBlocks: false,
        showLineNumbers: false,
        theme: 'github-light',
        wrapLines: false,
      }),
    ).toMatchObject({
      copy: false,
      panel: false,
      patchDocsCodeBlocks: false,
      showLineNumbers: false,
      theme: 'github-light',
      wrapLines: false,
    });
  });
});

describe('mergeSourceOptions', () => {
  it('lets story parameters override display options', () => {
    const merged = mergeSourceOptions(normalizeOptions({ copy: false }), {
      copy: true,
      showLineNumbers: false,
      wrapLines: false,
    });

    expect(merged).toMatchObject({
      copy: true,
      showLineNumbers: false,
      wrapLines: false,
    });
  });

  it('keeps global display options when story parameters are missing', () => {
    expect(
      mergeSourceOptions(
        normalizeOptions({
          copy: false,
          showLineNumbers: false,
          wrapLines: false,
        }),
        undefined,
      ),
    ).toMatchObject({
      copy: false,
      showLineNumbers: false,
      wrapLines: false,
    });
  });
});
