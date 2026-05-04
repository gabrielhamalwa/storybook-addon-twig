// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigCodeViewer } from './TwigCodeViewer';

const syntaxHighlighterMock = vi.hoisted(() => vi.fn());

vi.mock('storybook/internal/components', () => ({
  SyntaxHighlighter: (props: Record<string, unknown> & { children?: string }) => {
    syntaxHighlighterMock(props);
    return (
      <pre data-testid="syntax-highlighter" data-language={String(props.language)}>
        {props.children}
      </pre>
    );
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

  it('renders source with configured line and wrap settings', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" showLineNumbers wrapLines />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="syntax-highlighter"]')).not.toBeNull();
    });

    const call = syntaxHighlighterMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(call.language).toBe('twig');
    expect(call.bordered).toBe(false);
    expect(call.copyable).toBe(false);
    expect(call.padded).toBe(true);
    expect(call.showLineNumbers).toBe(true);
    expect(call.wrapLongLines).toBe(true);
  });

  it('passes wrapLongLines=false when wrapping is disabled', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" showLineNumbers wrapLines={false} />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="syntax-highlighter"]')).not.toBeNull();
    });

    const call = syntaxHighlighterMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(call.showLineNumbers).toBe(true);
    expect(call.wrapLongLines).toBe(false);
  });

  it('allows docs surfaces to override copy and border behavior', async () => {
    root.render(
      <TwigCodeViewer
        bordered
        code="{{ label }}"
        copyable
        customStyle={{ margin: 12 }}
        padded={false}
        showLineNumbers={false}
        wrapLines
      />,
    );

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="syntax-highlighter"]')).not.toBeNull();
    });

    const call = syntaxHighlighterMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(call.bordered).toBe(true);
    expect(call.copyable).toBe(true);
    expect(call.padded).toBe(false);
    expect(call.customStyle).toMatchObject({ margin: 12, minHeight: '100%' });
  });
});
