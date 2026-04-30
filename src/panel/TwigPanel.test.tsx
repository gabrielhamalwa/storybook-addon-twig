// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigPanel } from './TwigPanel';

const useParameterMock = vi.hoisted(() => vi.fn());
const addonPanelMock = vi.hoisted(() =>
  vi.fn(({ active, children }: { active: boolean; children: ReactNode }) => (
    <section data-active={String(active)} data-testid="addon-panel">
      {children}
    </section>
  )),
);
const emptyTabContentMock = vi.hoisted(() =>
  vi.fn(({ description, title }: { description?: ReactNode; title: ReactNode }) => (
    <div data-testid="empty-tab-content">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )),
);

vi.mock('storybook/manager-api', () => ({
  useParameter: useParameterMock,
}));

vi.mock('storybook/internal/components', () => ({
  AddonPanel: addonPanelMock,
  EmptyTabContent: emptyTabContentMock,
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
    addonPanelMock.mockClear();
    emptyTabContentMock.mockClear();
  });

  afterEach(() => {
    root.unmount();
  });

  it('passes inactive state to Storybook AddonPanel', () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    flushSync(() => {
      root.render(<TwigPanel active={false} />);
    });

    expect(container.querySelector('[data-testid="addon-panel"]')?.getAttribute('data-active')).toBe('false');
  });

  it('renders an empty state when no Twig source is configured', async () => {
    useParameterMock.mockReturnValue(undefined);

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.textContent).toContain('No Twig source configured');
    });
    expect(emptyTabContentMock).toHaveBeenCalled();
  });

  it('renders the code viewer when Twig source is configured', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')?.textContent).toBe('{{ label }}');
    });
  });
});
