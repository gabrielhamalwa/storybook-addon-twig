import { describe, expect, it } from 'vitest';

import { mergeSourceOptions, normalizeOptions } from './options';

describe('normalizeOptions', () => {
  it('uses stable defaults', () => {
    expect(normalizeOptions(undefined)).toMatchObject({
      copy: true,
      docsCodeBlocks: true,
      panel: true,
      showLineNumbers: true,
      wrapLines: true,
    });
  });

  it('preserves explicit supported option overrides', () => {
    expect(
      normalizeOptions({
        copy: false,
        docsCodeBlocks: false,
        panel: false,
        showLineNumbers: false,
        wrapLines: false,
      }),
    ).toMatchObject({
      copy: false,
      docsCodeBlocks: false,
      panel: false,
      showLineNumbers: false,
      wrapLines: false,
    });
  });

  it('keeps the old Docs option name as a compatibility alias', () => {
    expect(normalizeOptions({ patchDocsCodeBlocks: false })).toMatchObject({
      docsCodeBlocks: false,
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
