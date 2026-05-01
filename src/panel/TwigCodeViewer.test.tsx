// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigCodeViewer } from './TwigCodeViewer';

describe('TwigCodeViewer', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    document.documentElement.innerHTML = '<head></head><body></body>';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    root.unmount();
  });

  it('renders source with line numbers', async () => {
    root.render(
      <TwigCodeViewer code="{{ label }}" parameter={{ fileName: 'button.html.twig', source: '{{ label }}' }} />,
    );

    await vi.waitFor(() => {
      expect(container.querySelector('code.language-twig')).not.toBeNull();
    });

    expect(container.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe(
      'Twig source for button.html.twig',
    );
    expect(container.querySelector('pre')?.textContent).toContain('1{{ label }}');
    expect(container.querySelector('button')?.textContent).toBe('Copy');
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
      expect(container.querySelector('code.language-twig')).not.toBeNull();
    });

    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('pre')?.textContent).toBe('{{ label }}');
  });

  it('keeps line-numbered code unwrapped when wrapping is disabled', async () => {
    root.render(
      <TwigCodeViewer
        code="{{ label }}"
        options={{ wrapLines: true }}
        parameter={{ source: '{{ label }}', wrapLines: false }}
      />,
    );

    await vi.waitFor(() => {
      expect(container.querySelector('code.language-twig')).not.toBeNull();
    });

    expect(
      (container.querySelector('code.language-twig span span:last-child') as HTMLElement | null)?.style.whiteSpace,
    ).toBe('pre');
  });

  it('copies source when copy is enabled', async () => {
    root.render(<TwigCodeViewer code="{{ label }}" />);

    await vi.waitFor(() => {
      expect(container.querySelector('button')).not.toBeNull();
    });

    container.querySelector('button')?.click();

    await vi.waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('{{ label }}');
    });
    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copied');
    });
    await new Promise((resolve) => {
      window.setTimeout(resolve, 1300);
    });
    await vi.waitFor(() => {
      expect(container.querySelector('button')?.textContent).toBe('Copy');
    });
  });

  it('hides the copy button when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    root.render(<TwigCodeViewer code="{{ label }}" />);

    await vi.waitFor(() => {
      expect(container.querySelector('code.language-twig')).not.toBeNull();
    });

    expect(container.querySelector('button')).toBeNull();
  });
});
