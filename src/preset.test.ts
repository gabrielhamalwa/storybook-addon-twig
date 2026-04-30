import { describe, expect, it } from 'vitest';

import { OPTIONS_GLOBAL } from './constants';
import { managerHead, previewHead } from './preset';

describe('preset head hooks', () => {
  it('injects serialized addon options into manager and preview heads', () => {
    const options = {
      patchDocsCodeBlocks: false,
      theme: 'github-light',
    };

    expect(managerHead('<meta name="manager" />', options)).toContain(
      `window.${OPTIONS_GLOBAL} = {"patchDocsCodeBlocks":false,"theme":"github-light"}`,
    );
    expect(previewHead('<meta name="preview" />', options)).toContain(
      `window.${OPTIONS_GLOBAL} = {"patchDocsCodeBlocks":false,"theme":"github-light"}`,
    );
  });

  it('escapes option values that could break out of a script tag', () => {
    const head = managerHead('', {
      theme: '</script><script>alert(1)</script>',
    });

    expect(head).toContain('\\u003c/script>');
    expect(head).not.toContain('</script><script>');
  });

  it('serializes an empty options object by default', () => {
    expect(previewHead()).toBe(`\n<script>window.${OPTIONS_GLOBAL} = {};</script>`);
  });
});
