// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigPanel } from './TwigPanel';

const useParameterMock = vi.hoisted(() => vi.fn());
const useStorybookStateMock = vi.hoisted(() => vi.fn(() => ({ storyId: 'story-1' })));
const openInEditorMock = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const copyToClipboardMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('storybook/manager-api', () => ({
  useParameter: useParameterMock,
  useStorybookState: useStorybookStateMock,
  useStorybookApi: () => ({
    openInEditor: openInEditorMock,
  }),
}));

vi.mock('storybook/internal/components', () => ({
  AddonPanel: ({ active, children }: { active: boolean; children: React.ReactNode }) => (
    <div data-testid="addon-panel" data-active={String(active)}>
      {children}
    </div>
  ),
  EmptyTabContent: ({
    title,
    description,
    footer,
  }: {
    title: string;
    description: React.ReactNode;
    footer: React.ReactNode;
  }) => (
    <div data-testid="empty-tab-content">
      <h3>{title}</h3>
      <div>{description}</div>
      <div>{footer}</div>
    </div>
  ),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
  Button: ({
    children,
    onClick,
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    ariaLabel?: string | boolean;
  }) => (
    <button aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined} onClick={onClick} type="button">
      {children}
    </button>
  ),
  Separator: () => <span>|</span>,
  createCopyToClipboardFunction: () => copyToClipboardMock,
}));

vi.mock('@storybook/icons', () => ({
  SyncIcon: () => <svg data-testid="sync-icon" />,
}));

vi.mock('./TwigCodeViewer', () => ({
  TwigCodeViewer: ({
    code,
    showLineNumbers,
    wrapLines,
  }: {
    code: string;
    showLineNumbers: boolean;
    wrapLines: boolean;
  }) => (
    <div data-testid="viewer">
      {code}|lines:{String(showLineNumbers)}|wrap:{String(wrapLines)}
    </div>
  ),
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
    useStorybookStateMock.mockReturnValue({ storyId: 'story-1' });
    copyToClipboardMock.mockClear();
    openInEditorMock.mockClear();
  });

  afterEach(() => {
    root.unmount();
  });

  it('uses AddonPanel active state', () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    flushSync(() => {
      root.render(<TwigPanel active={false} />);
    });

    expect(container.querySelector('[data-testid="addon-panel"]')?.getAttribute('data-active')).toBe('false');
  });

  it('renders EmptyTabContent when no Twig source is configured', async () => {
    useParameterMock.mockReturnValue(undefined);

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="empty-tab-content"]')).not.toBeNull();
    });
    expect(container.textContent).toContain('Twig');
    expect(container.textContent).toContain('No Twig source is configured for this story.');
    expect(container.querySelector('a')?.getAttribute('href')).toContain(
      'github.com/gabrielhamalwa/storybook-addon-twig',
    );
  });

  it('renders top controls in expected order', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    root.render(<TwigPanel active options={{ showLineNumbers: true, wrapLines: true }} />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')).not.toBeNull();
    });

    const buttonTexts = Array.from(container.querySelectorAll('button')).map((button) => button.textContent?.trim());
    expect(buttonTexts).toEqual(['Copy', 'Scroll to end', 'Off', 'On', 'Off', 'On', '', 'button.twig']);
    expect(container.textContent).toContain('Line numbers');
    expect(container.textContent).toContain('Wrap lines');
    expect(container.textContent).toContain('|');
    expect(container.querySelector('[data-testid="sync-icon"]')).not.toBeNull();
  });

  it('copies source from top Copy button', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelector('button')).not.toBeNull();
    });

    const copyButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Copy');
    copyButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      expect(copyToClipboardMock).toHaveBeenCalledWith('{{ label }}');
    });
  });

  it('resets toggles when story id changes', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    root.render(<TwigPanel active options={{ showLineNumbers: true, wrapLines: true }} />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')?.textContent).toContain('lines:true');
    });

    const wrapButtons = Array.from(container.querySelectorAll('button')).filter(
      (button) => button.textContent === 'Off',
    );
    const wrapButton = wrapButtons[1];
    wrapButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')?.textContent).toContain('wrap:false');
    });

    useStorybookStateMock.mockReturnValue({ storyId: 'story-2' });
    root.render(<TwigPanel active options={{ showLineNumbers: true, wrapLines: true }} />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')?.textContent).toContain('wrap:true');
    });
  });

  it('opens file in editor from header button', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.stories.ts', source: '{{ label }}' });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    });

    const fileButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'button.stories.ts',
    );
    fileButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      expect(openInEditorMock).toHaveBeenCalledWith({ file: 'button.stories.ts' });
    });
  });

  it('hides copy button when copy is disabled', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}', copy: false });

    root.render(<TwigPanel active options={{ copy: true }} />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')).not.toBeNull();
    });

    const copyButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Copy');
    expect(copyButton).toBeUndefined();
  });
});
