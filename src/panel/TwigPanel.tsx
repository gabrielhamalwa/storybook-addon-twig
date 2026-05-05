import React from 'react';
import { FORCE_RE_RENDER } from 'storybook/internal/core-events';
import { AddonPanel, Button, EmptyTabContent, Link, Separator } from 'storybook/internal/components';
import { createCopyToClipboardFunction } from 'storybook/internal/components';
import { addons, useParameter, useStorybookApi, useStorybookState } from 'storybook/manager-api';
import { useTheme } from 'storybook/theming';
import type { Theme } from 'storybook/theming';
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
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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

  function refreshTwig(): void {
    addons.getChannel().emit(FORCE_RE_RENDER);
  }

  function scrollToEnd(): void {
    const viewer = viewerRef.current as HTMLDivElement;
    viewer.scrollTo({
      behavior: 'smooth',
      top: viewer.scrollHeight,
    });
  }

  if (!source) {
    return React.createElement(AddonPanel, {
      active: !!active,
      children: React.createElement(EmptyTabContent, {
        title: 'Twig',
        description: React.createElement(
          React.Fragment,
          null,
          'No Twig source is configured for this story. Add ',
          React.createElement('code', null, 'parameters.twig.source'),
          '.',
        ),
        footer: React.createElement(Link, { href: DOCS_URL, target: '_blank', withArrow: true }, 'Read docs'),
      }),
    });
  }
  const resolvedSource = source;

  async function handleCopy(): Promise<void> {
    await copyToClipboard(resolvedSource.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function openSourceFile(fileName: string): Promise<void> {
    await api.openInEditor({ file: fileName });
  }
  const sourceFileName = resolvedSource.fileName ?? null;

  const content = React.createElement(TwigCodeViewer, {
    code: resolvedSource.code,
    showLineNumbers,
    wrapLines,
  });
  return React.createElement(AddonPanel, {
    active: !!active,
    children: React.createElement(
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
            styles,
            value: showLineNumbers,
          }),
          React.createElement('span', { 'aria-hidden': true, style: styles.controlDivider }),
          React.createElement(BooleanSegmentControl, {
            label: 'Wrap lines',
            onChange: setWrapLines,
            styles,
            value: wrapLines,
          }),
          React.createElement(Separator, { force: true }),
          React.createElement(
            Button,
            { ariaLabel: 'Refresh twig source', onClick: refreshTwig, size: 'small', variant: 'ghost' },
            React.createElement(SyncIcon, { 'aria-hidden': true }),
          ),
        ),
        sourceFileName
          ? React.createElement(
              Button,
              {
                ariaLabel: 'Open in editor',
                onClick: () => void openSourceFile(sourceFileName),
                padding: 'small',
                size: 'small',
                style: styles.openInEditorButton,
                variant: 'ghost',
              },
              sourceFileName,
            )
          : null,
      ),
      React.createElement('div', { ref: viewerRef, style: styles.viewer }, content),
    ),
  });
}

type BooleanSegmentControlProps = {
  label: string;
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
  styles: ReturnType<typeof createStyles>;
  value: boolean;
};

function BooleanSegmentControl({ label, onChange, styles, value }: BooleanSegmentControlProps): React.ReactElement {
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

function createStyles(theme: Theme): Record<string, React.CSSProperties> {
  const selectedTextColor = theme.base === 'dark' ? theme.textInverseColor : '#ffffff';

  return {
    panel: {
      background: theme.appContentBg,
      color: theme.textColor,
      display: 'grid',
      gridTemplateRows: 'auto minmax(0, 1fr)',
      height: '100%',
      minHeight: 0,
    },
    toolbar: {
      alignItems: 'center',
      background: theme.barBg,
      borderBottom: `1px solid ${theme.appBorderColor}`,
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
      background: theme.booleanBg,
      border: `1px solid ${theme.appBorderColor}`,
      borderRadius: 999,
      display: 'flex',
      gap: 2,
      padding: 1,
    },
    segmentSelectedOnButton: {
      background: theme.barSelectedColor,
      border: `1px solid ${theme.barSelectedColor}`,
      borderRadius: 999,
      color: selectedTextColor,
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
      background: theme.booleanSelectedBg,
      border: `1px solid ${theme.appBorderColor}`,
      borderRadius: 999,
      color: theme.textColor,
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
      background: theme.appBorderColor,
      height: 18,
      width: 1,
    },
    segmentInactiveButton: {
      background: 'transparent',
      border: '1px solid transparent',
      borderRadius: 999,
      color: theme.textMutedColor,
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
      color: theme.textColor,
      fontSize: 13,
      fontWeight: 600,
      lineHeight: '20px',
    },
    openInEditorButton: {
      color: theme.barSelectedColor,
      fontSize: 13,
      fontWeight: 700,
      justifyContent: 'flex-end',
      lineHeight: '24px',
      textAlign: 'right',
      whiteSpace: 'nowrap',
    },
    viewer: {
      background: theme.appContentBg,
      minHeight: 0,
      overflow: 'auto',
    },
  };
}
