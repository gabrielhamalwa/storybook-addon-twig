// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigCodeViewer } from './TwigCodeViewer';

const syntaxHighlighterMock = vi.hoisted(() =>
  vi.fn(
    ({
      children,
      copyable,
      language,
      padded,
      showLineNumbers,
      wrapLongLines,
    }: {
      children: ReactNode;
      copyable: boolean;
      language: string;
      padded: boolean;
      showLineNumbers: boolean;
      wrapLongLines: boolean;
    }) => (
      <pre
        data-copyable={String(copyable)}
        data-language={language}
        data-padded={String(padded)}
        data-show-line-numbers={String(showLineNumbers)}
        data-wrap-long-lines={String(wrapLongLines)}
        data-testid="syntax-highlighter"
      >
        {children}
      </pre>
    ),
  ),
);

vi.mock('storybook/internal/components', () => ({
  SyntaxHighlighter: syntaxHighlighterMock,
}));

vi.mock('storybook/theming', () => ({
  styled: {
    div:
      () =>
      ({ children }: { children: ReactNode }) => <div data-testid="source-panel">{children}</div>,
  },
}));

describe('TwigCodeViewer', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    document.documentElement.innerHTML = '<head></head><body></body>';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    syntaxHighlighterMock.mockClear();
  });

  afterEach(() => {
    root.unmount();
  });

  it('renders source through Storybook syntax highlighting', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="syntax-highlighter"]')).not.toBeNull();
    });

    expect(container.querySelector('[data-testid="source-panel"]')).not.toBeNull();
    expect(container.querySelector('pre')?.textContent).toBe('{{ label }}');
    expect(syntaxHighlighterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        bordered: false,
        children: '{{ label }}',
        copyable: true,
        format: 'dedent',
        language: 'twig',
        padded: true,
        showLineNumbers: true,
        wrapLongLines: true,
      }),
      {},
    );
  });

  it('lets story parameters override display options', async () => {
    root.render(
      <TwigCodeViewer
        code="{{ label }}"
        options={{ copy: true, showLineNumbers: true, wrapLines: true }}
        parameter={{ copy: false, showLineNumbers: false, source: '{{ label }}', wrapLines: false }}
      />,
    );

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="syntax-highlighter"]')).not.toBeNull();
    });

    expect(syntaxHighlighterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        copyable: false,
        showLineNumbers: false,
        wrapLongLines: false,
      }),
      {},
    );
  });
});
