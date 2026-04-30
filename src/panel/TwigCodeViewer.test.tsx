// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigCodeViewer } from './TwigCodeViewer';

const renderTwigToHtmlMock = vi.hoisted(() => vi.fn());
const copyTextMock = vi.hoisted(() => vi.fn());

vi.mock('../highlight/createHighlighter', () => ({
  renderTwigToHtml: renderTwigToHtmlMock,
}));

vi.mock('../runtime/copy', () => ({
  copyText: copyTextMock,
}));

describe('TwigCodeViewer', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.innerHTML = '<head></head><body></body>';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    renderTwigToHtmlMock.mockReset();
    copyTextMock.mockReset();
    renderTwigToHtmlMock.mockResolvedValue('<pre class="shiki satw-code"><code>{{ label }}</code></pre>');
    copyTextMock.mockResolvedValue(true);
  });

  afterEach(() => {
    root.unmount();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders highlighted Twig with file metadata', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" fileName="button.twig" />);

    await vi.waitFor(() => {
      expect(container.querySelector('.shiki')).not.toBeNull();
    });

    expect(container.textContent).toContain('Twig');
    expect(container.textContent).toContain('button.twig');
    expect(renderTwigToHtmlMock).toHaveBeenCalledWith(
      '{{ label }}',
      expect.objectContaining({
        copy: true,
        showLineNumbers: true,
        theme: 'github-dark',
        wrapLines: true,
      }),
    );
  });

  it('copies source and resets copied state', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" />);

    await vi.waitFor(() => {
      expect(container.querySelector('button')?.getAttribute('aria-label')).toBe('Copy Twig source');
    });

    container.querySelector('button')?.click();

    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copied');
    });

    expect(copyTextMock).toHaveBeenCalledWith('{{ label }}', navigator.clipboard, document);

    await vi.advanceTimersByTimeAsync(1600);

    expect(container.querySelector('button')?.textContent).toBe('Copy');
  });

  it('does not show copied state when copy fails', async () => {
    copyTextMock.mockResolvedValueOnce(false);
    root.render(<TwigCodeViewer code="{{ label }}" />);

    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copy');
    });

    container.querySelector('button')?.click();

    await vi.waitFor(() => {
      expect(copyTextMock).toHaveBeenCalledTimes(1);
    });

    expect(container.querySelector('button')?.textContent).toBe('Copy');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('replaces a pending copied-state timer on repeated copy', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" />);

    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copy');
    });

    container.querySelector('button')?.click();

    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copied');
    });

    container.querySelector('button')?.click();

    await vi.waitFor(() => {
      expect(copyTextMock).toHaveBeenCalledTimes(2);
    });

    expect(vi.getTimerCount()).toBe(1);
  });

  it('clears a pending copied-state timer on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    root.render(<TwigCodeViewer code="{{ label }}" />);

    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copy');
    });

    container.querySelector('button')?.click();

    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copied');
    });

    root.unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('does not show copy controls when disabled by story parameters', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" parameter={{ copy: false, source: '{{ label }}' }} />);

    await vi.waitFor(() => {
      expect(container.querySelector('.shiki')).not.toBeNull();
    });

    expect(container.querySelector('button')).toBeNull();
  });

  it('does not update rendered html after unmount', async () => {
    let resolveRender: (html: string) => void = () => undefined;
    renderTwigToHtmlMock.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveRender = resolve;
      }),
    );

    root.render(<TwigCodeViewer code="{{ label }}" />);
    await vi.waitFor(() => {
      expect(renderTwigToHtmlMock).toHaveBeenCalledTimes(1);
    });
    root.unmount();
    resolveRender('<pre class="shiki satw-code"><code>{{ label }}</code></pre>');

    await vi.waitFor(() => {
      expect(container.querySelector('.shiki')).toBeNull();
    });

    expect(container.querySelector('.shiki')).toBeNull();
  });

  it('renders escaped plain code when highlighting fails', async () => {
    renderTwigToHtmlMock.mockRejectedValueOnce(new Error('Shiki failed'));
    root.render(<TwigCodeViewer code={'<button>{{ label }}</button>'} />);

    await vi.waitFor(() => {
      expect(container.querySelector('.satw-code--fallback')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('<span class="line">&lt;button&gt;{{ label }}&lt;/button&gt;</span>');
    expect(container.querySelector('.satw-code--line-numbers')).not.toBeNull();
    expect(container.querySelector('.satw-code--wrap-lines')).not.toBeNull();
  });

  it('renders plain fallback without optional layout classes when disabled', async () => {
    renderTwigToHtmlMock.mockRejectedValueOnce(new Error('Shiki failed'));
    root.render(
      <TwigCodeViewer
        code={'{{ label }}'}
        parameter={{ source: '{{ label }}', showLineNumbers: false, wrapLines: false }}
      />,
    );

    await vi.waitFor(() => {
      expect(container.querySelector('.satw-code--fallback')).not.toBeNull();
    });

    expect(container.querySelector('.satw-code--line-numbers')).toBeNull();
    expect(container.querySelector('.satw-code--wrap-lines')).toBeNull();
  });
});
