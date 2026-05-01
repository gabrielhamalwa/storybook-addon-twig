import React from 'react';
import { FORCE_RE_RENDER } from 'storybook/internal/core-events';
import { AddonPanel, Button, EmptyTabContent, Link, Separator } from 'storybook/internal/components';
import { createCopyToClipboardFunction } from 'storybook/internal/components';
import { addons, useParameter, useStorybookApi, useStorybookState } from 'storybook/manager-api';
import { SyncIcon } from '@storybook/icons';

import { PARAM_KEY } from '../constants';
import { mergeSourceOptions, normalizeOptions } from '../options';
import { collectTwigSource } from '../runtime/collectSource';
import type { TwigAddonOptions, TwigSourceParameter } from '../types';
import { TwigCodeViewer } from './TwigCodeViewer';

type TwigPanelProps = {
  active?: boolean;
  options?: TwigAddonOptions;
};

const DOCS_URL = 'https://github.com/gabrielhamalwa/storybook-addon-twig#readme';

export function TwigPanel({ active, options }: TwigPanelProps): React.ReactElement {
  const parameter = useParameter<TwigSourceParameter | undefined>(PARAM_KEY, undefined);
  const api = useStorybookApi();
  const { storyId } = useStorybookState();
  const source = collectTwigSource(parameter);
  const resolvedOptions = React.useMemo(
    () => mergeSourceOptions(normalizeOptions(options), parameter),
    [options, parameter],
  );
  const [copied, setCopied] = React.useState(false);
  const [showLineNumbers, setShowLineNumbers] = React.useState(resolvedOptions.showLineNumbers);
  const [wrapLines, setWrapLines] = React.useState(resolvedOptions.wrapLines);
  const copyToClipboard = React.useMemo(() => createCopyToClipboardFunction(), []);
  const viewerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setShowLineNumbers(resolvedOptions.showLineNumbers);
    setWrapLines(resolvedOptions.wrapLines);
    setCopied(false);
  }, [storyId, resolvedOptions.showLineNumbers, resolvedOptions.wrapLines]);

  async function handleCopy(): Promise<void> {
    if (!source) {
      return;
    }

    await copyToClipboard(source.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function refreshTwig(): void {
    addons.getChannel().emit(FORCE_RE_RENDER);
  }

  function scrollToEnd(): void {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    viewer.scrollTo({
      top: viewer.scrollHeight,
      behavior: 'smooth',
    });
  }

  async function openSourceFile(): Promise<void> {
    if (!source?.fileName) {
      return;
    }
    await api.openInEditor({ file: source.fileName });
  }

  const content = source
    ? React.createElement(TwigCodeViewer, {
        code: source.code,
        showLineNumbers,
        wrapLines,
      })
    : React.createElement(EmptyTabContent, {
        title: 'Twig',
        description: React.createElement(
          React.Fragment,
          null,
          'No Twig source is configured for this story. Add ',
          React.createElement('code', null, 'parameters.twig.source'),
          '.',
        ),
        footer: React.createElement(Link, { href: DOCS_URL, target: '_blank', withArrow: true }, 'Read docs'),
      });
  return React.createElement(AddonPanel, {
    active: !!active,
    children: source
      ? React.createElement(
          'section',
          { style: styles.panel },
          React.createElement(
            'header',
            { style: styles.toolbar },
            React.createElement(
              'div',
              { style: styles.leftControls },
              React.createElement(
                React.Fragment,
                null,
                resolvedOptions.copy
                  ? React.createElement(
                      Button,
                      {
                        ariaLabel: false,
                        onClick: () => void handleCopy(),
                        size: 'small',
                        variant: 'outline',
                      },
                      copied ? 'Copied' : 'Copy',
                    )
                  : null,
              ),
              React.createElement(
                Button,
                {
                  ariaLabel: false,
                  onClick: scrollToEnd,
                  size: 'small',
                  variant: 'outline',
                },
                'Scroll to end',
              ),
              React.createElement(Separator, { force: true }),
              React.createElement(BooleanSegmentControl, {
                label: 'Line numbers',
                onChange: setShowLineNumbers,
                value: showLineNumbers,
              }),
              React.createElement('span', { 'aria-hidden': true, style: styles.controlDivider }),
              React.createElement(BooleanSegmentControl, {
                label: 'Wrap lines',
                onChange: setWrapLines,
                value: wrapLines,
              }),
              React.createElement(Separator, { force: true }),
              React.createElement(
                Button,
                { ariaLabel: 'Refresh twig source', onClick: refreshTwig, size: 'small', variant: 'ghost' },
                React.createElement(SyncIcon, { 'aria-hidden': true }),
              ),
            ),
            source?.fileName
              ? React.createElement(
                  Button,
                  {
                    ariaLabel: 'Open in editor',
                    onClick: () => void openSourceFile(),
                    padding: 'small',
                    size: 'small',
                    style: styles.openInEditorButton,
                    variant: 'ghost',
                  },
                  source.fileName,
                )
              : null,
          ),
          React.createElement('div', { ref: viewerRef, style: styles.viewer }, content),
        )
      : content,
  });
}

type BooleanSegmentControlProps = {
  label: string;
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
  value: boolean;
};

function BooleanSegmentControl({ label, onChange, value }: BooleanSegmentControlProps): React.ReactElement {
  return React.createElement(
    'div',
    { style: styles.segmentGroup },
    React.createElement('span', { style: styles.segmentLabel }, label),
    React.createElement(
      'div',
      { style: styles.segmentControl },
      React.createElement(
        Button,
        {
          ariaLabel: false,
          onClick: () => onChange(false),
          size: 'small',
          style: value ? styles.segmentInactiveButton : styles.segmentSelectedOffButton,
          variant: 'ghost',
        },
        'Off',
      ),
      React.createElement(
        Button,
        {
          ariaLabel: false,
          onClick: () => onChange(true),
          size: 'small',
          style: value ? styles.segmentSelectedOnButton : styles.segmentInactiveButton,
          variant: 'ghost',
        },
        'On',
      ),
    ),
  );
}

const styles = {
  panel: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    height: '100%',
    minHeight: 0,
  },
  toolbar: {
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border, #d9e2ec)',
    display: 'flex',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 44,
    padding: '6px 10px',
  },
  leftControls: {
    alignItems: 'center',
    display: 'flex',
    gap: 8,
  },
  segmentControl: {
    background: 'var(--color-bg, #eef1f5)',
    border: '1px solid var(--color-border, #d9e2ec)',
    borderRadius: 999,
    display: 'flex',
    gap: 2,
    padding: 1,
  },
  segmentSelectedOnButton: {
    background: '#2da44e',
    border: '1px solid #2a9b49',
    borderRadius: 999,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 600,
    height: 22,
    lineHeight: '18px',
    minHeight: 22,
    minWidth: 44,
    justifyContent: 'center',
    paddingBlock: 0,
    paddingInline: 8,
  },
  segmentSelectedOffButton: {
    background: 'var(--color-lightest, #ffffff)',
    border: '1px solid var(--color-border, #d9e2ec)',
    borderRadius: 999,
    color: 'var(--color-default-text, #2e3438)',
    fontSize: 13,
    fontWeight: 600,
    height: 22,
    lineHeight: '18px',
    minHeight: 22,
    minWidth: 44,
    justifyContent: 'center',
    paddingBlock: 0,
    paddingInline: 8,
  },
  segmentGroup: {
    alignItems: 'center',
    display: 'flex',
    gap: 10,
  },
  controlDivider: {
    background: 'var(--color-border, #d9e2ec)',
    height: 18,
    width: 1,
  },
  segmentInactiveButton: {
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 999,
    color: 'var(--color-subtle-text, #7f8ca3)',
    fontSize: 13,
    fontWeight: 600,
    height: 22,
    lineHeight: '18px',
    minHeight: 22,
    minWidth: 44,
    justifyContent: 'center',
    paddingBlock: 0,
    paddingInline: 8,
  },
  segmentLabel: {
    color: 'var(--color-default-text, #2e3438)',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '20px',
  },
  openInEditorButton: {
    color: 'var(--color-secondary-text, #1f67ff)',
    fontSize: 13,
    fontWeight: 700,
    justifyContent: 'flex-end',
    lineHeight: '24px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  viewer: {
    minHeight: 0,
    overflow: 'auto',
  },
} satisfies Record<string, React.CSSProperties>;
