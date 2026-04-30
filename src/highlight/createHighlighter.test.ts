import { describe, expect, it } from 'vitest';

import { getTwigHighlighter, renderTwigToHtml } from './createHighlighter';

describe('Twig Shiki rendering', () => {
  it('renders Twig with the project code classes', async () => {
    const html = await renderTwigToHtml('{% if enabled %}{{ label }}{% endif %}', {
      showLineNumbers: true,
      theme: 'github-dark',
      wrapLines: true,
    });

    expect(html).toContain('satw-code');
    expect(html).toContain('satw-code--line-numbers');
    expect(html).toContain('satw-code--wrap-lines');
    expect(html).toContain('shiki');
  });

  it('falls back to the default theme for unsupported theme names', async () => {
    await expect(getTwigHighlighter('not-a-theme')).resolves.toMatchObject({
      language: 'twig',
      theme: 'github-dark',
    });
  });

  it('omits optional layout classes when disabled', async () => {
    const html = await renderTwigToHtml('{{ label }}', {
      showLineNumbers: false,
      theme: 'github-light',
      wrapLines: false,
    });

    expect(html).toContain('satw-code');
    expect(html).not.toContain('satw-code--line-numbers');
    expect(html).not.toContain('satw-code--wrap-lines');
  });
});
