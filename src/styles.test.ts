// @vitest-environment happy-dom

import { beforeEach, describe, expect, it } from 'vitest';

import { installAddonStyles } from './styles';

describe('installAddonStyles', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '<head></head><body></body>';
  });

  it('injects addon styles once', () => {
    installAddonStyles(document);
    installAddonStyles(document);

    expect(document.querySelectorAll('#storybook-addon-twig-styles')).toHaveLength(1);
    expect(document.querySelector('#storybook-addon-twig-styles')?.textContent).toContain('.satw-panel');
    expect(document.querySelector('#storybook-addon-twig-styles')?.textContent).toContain('.satw-code--docs');
    expect(document.querySelector('#storybook-addon-twig-styles')?.textContent).toContain(
      'background: transparent !important;',
    );
  });
});
