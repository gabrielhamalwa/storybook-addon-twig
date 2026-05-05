// @vitest-environment happy-dom

import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwigPanel } from './TwigPanel';

const useParameterMock = vi.hoisted(() => vi.fn());
const useStorybookStateMock = vi.hoisted(() => vi.fn(() => ({ storyId: 'story-1' })));
const openInEditorMock = vi.hoisted(() => vi.fn().mockResolvedValue({}));
const copyToClipboardMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const emitMock = vi.hoisted(() => vi.fn());
const getChannelMock = vi.hoisted(() => vi.fn(() => ({ emit: emitMock })));
const lightTheme = vi.hoisted(() => ({
  appBorderColor: 'hsl(212 50% 30% / 0.15)',
  appContentBg: '#FFFFFF',
  barBg: '#FFFFFF',
  barSelectedColor: '#0063D6',
  base: 'light',
  booleanBg: '#ECF2F9',
  booleanSelectedBg: '#FFFFFF',
  textColor: '#2E3338',
  textInverseColor: '#FFFFFF',
  textMutedColor: '#5C6570',
}));
const darkTheme = vi.hoisted(() => ({
  appBorderColor: '#30363D',
  appContentBg: '#222325',
  barBg: '#222325',
  barSelectedColor: '#479DFF',
  base: 'dark',
  booleanBg: '#1B1C1D',
  booleanSelectedBg: '#292B2E',
  textColor: '#C9CCCF',
  textInverseColor: '#1B1C1D',
  textMutedColor: '#95999D',
}));
const useThemeMock = vi.hoisted(() => vi.fn(() => lightTheme));

vi.mock('storybook/manager-api', () => ({
  useParameter: useParameterMock,
  useStorybookState: useStorybookStateMock,
  addons: {
    getChannel: getChannelMock,
  },
  useStorybookApi: () => ({
    openInEditor: openInEditorMock,
  }),
}));

vi.mock('storybook/theming', () => ({
  useTheme: useThemeMock,
}));

vi.mock('storybook/internal/core-events', () => ({
  FORCE_RE_RENDER: 'forceReRender',
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
    style,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    ariaLabel?: string | boolean;
    style?: React.CSSProperties;
  }) => (
    <button
      aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
      onClick={onClick}
      style={style}
      type="button"
    >
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
    emitMock.mockClear();
    useThemeMock.mockReturnValue(lightTheme);
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

  it('uses Storybook theme colors for dark mode-safe panel controls', async () => {
    useThemeMock.mockReturnValue(darkTheme);
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    root.render(<TwigPanel active options={{ showLineNumbers: true, wrapLines: true }} />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')).not.toBeNull();
    });

    const panel = container.querySelector('section') as HTMLElement;
    const header = container.querySelector('header') as HTMLElement;
    const lineNumbersOnButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'On',
    ) as HTMLButtonElement;
    const openInEditorButton = container.querySelector('button[aria-label="Open in editor"]') as HTMLButtonElement;

    expect(panel.style.background).toBe(darkTheme.appContentBg);
    expect(panel.style.color).toBe(darkTheme.textColor);
    expect(header.style.borderBottomColor).toBe(darkTheme.appBorderColor);
    expect(lineNumbersOnButton.style.background).toBe(darkTheme.barSelectedColor);
    expect(lineNumbersOnButton.style.color).toBe(darkTheme.textInverseColor);
    expect(openInEditorButton.style.color).toBe(darkTheme.barSelectedColor);
  });

  it('copies source from top Copy button', async () => {
    vi.useFakeTimers();
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
    await vi.waitFor(() => {
      const copiedButton = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent === 'Copied',
      );
      expect(copiedButton).toBeDefined();
    });
    vi.runAllTimers();
    vi.useRealTimers();
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
    expect(wrapButton).toBeDefined();
    wrapButton?.click();

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

  it('does not render open-in-editor button when fileName is missing', async () => {
    useParameterMock.mockReturnValue({ source: '{{ label }}' });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')).not.toBeNull();
    });

    const editorButton = container.querySelector('button[aria-label="Open in editor"]');
    expect(editorButton).toBeNull();
  });

  it('refresh button emits FORCE_RE_RENDER', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    });

    const refreshButton = container.querySelector('button[aria-label="Refresh twig source"]');
    refreshButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(emitMock).toHaveBeenCalledWith('forceReRender');
  });

  it('scrolls code viewer to end from header button', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}' });
    const scrollToMock = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
      writable: true,
    });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    });

    const scrollButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Scroll to end',
    );
    scrollButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(scrollToMock).toHaveBeenCalled();
  });

  it('allows selecting On for wrap lines segment', async () => {
    useParameterMock.mockReturnValue({ fileName: 'button.twig', source: '{{ label }}', wrapLines: false });

    root.render(<TwigPanel active />);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')?.textContent).toContain('wrap:false');
    });

    const wrapLabel = Array.from(container.querySelectorAll('span')).find((span) => span.textContent === 'Wrap lines');
    const wrapSegmentGroup = wrapLabel?.nextElementSibling;
    const wrapOnButton = Array.from(wrapSegmentGroup?.querySelectorAll('button') ?? []).find(
      (button) => button.textContent === 'On',
    );
    wrapOnButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      expect(container.querySelector('[data-testid="viewer"]')?.textContent).toContain('wrap:true');
    });
  });
});
