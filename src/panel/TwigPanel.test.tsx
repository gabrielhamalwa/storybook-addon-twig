// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigPanel } from './TwigPanel';

const useParameterMock = vi.hoisted(() => vi.fn());

vi.mock('storybook/manager-api', () => ({
  useParameter: useParameterMock,
}));

vi.mock('./TwigCodeViewer', () => ({
  TwigCodeViewer: ({ code }: { code: string }) => <div data-testid="viewer">{code}</div>,
}));

describe('TwigPanel', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    document.documentElement.innerHTML = '<head></head><body></body>';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    useParameterMock.mockReset();
  });

  afterEach(() => {
    root.unmount();
  });

  it('hides panel content while inactive', () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    flushSync(() => {
      root.render(<TwigPanel active={false} />);
    });

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector('[hidden]')).not.toBeNull();
  });

  it('renders an empty state when no Twig source is configured', async () => {
    useParameterMock.mockReturnValue(undefined);

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.textContent).toContain('No Twig source configured');
    });
  });

  it('renders the code viewer when Twig source is configured', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')?.textContent).toBe('{{ label }}');
    });
  });
});
