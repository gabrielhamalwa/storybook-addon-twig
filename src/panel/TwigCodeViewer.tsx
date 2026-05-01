import React, { useMemo, useState } from 'react';

import { mergeSourceOptions, normalizeOptions } from '../options';
import type { TwigAddonOptions, TwigSourceParameter } from '../types';

type TwigCodeViewerProps = {
  code: string;
  options?: TwigAddonOptions;
  parameter?: TwigSourceParameter;
};

export function TwigCodeViewer({ code, options, parameter }: TwigCodeViewerProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const resolvedOptions = useMemo(() => mergeSourceOptions(normalizeOptions(options), parameter), [options, parameter]);
  const lines = useMemo(() => code.split('\n'), [code]);
  const canCopy =
    resolvedOptions.copy && typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';

  async function copyCode(): Promise<void> {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return React.createElement(
    'div',
    {
      'aria-label': parameter?.fileName ? `Twig source for ${parameter.fileName}` : 'Twig source',
      role: 'region',
      style: styles.panel,
    },
    React.createElement(
      'pre',
      {
        style: {
          ...styles.pre,
          overflowX: resolvedOptions.wrapLines ? 'hidden' : 'auto',
        },
      },
      React.createElement(
        'code',
        {
          className: 'language-twig',
          style: styles.code,
        },
        resolvedOptions.showLineNumbers
          ? lines.map((line, index) =>
              React.createElement(
                'span',
                {
                  key: index,
                  style: styles.line,
                },
                React.createElement(
                  'span',
                  {
                    'aria-hidden': true,
                    style: styles.lineNumber,
                  },
                  index + 1,
                ),
                React.createElement(
                  'span',
                  {
                    style: {
                      ...styles.lineCode,
                      whiteSpace: resolvedOptions.wrapLines ? 'pre-wrap' : 'pre',
                    },
                  },
                  line,
                ),
              ),
            )
          : code,
      ),
    ),
    canCopy
      ? React.createElement(
          'div',
          { style: styles.footer },
          React.createElement(
            'button',
            {
              onClick: () => {
                void copyCode();
              },
              style: styles.copyButton,
              type: 'button',
            },
            copied ? 'Copied' : 'Copy',
          ),
        )
      : null,
  );
}

const styles = {
  panel: {
    background: 'var(--color-background, transparent)',
    color: 'var(--color-default-text, inherit)',
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    height: '100%',
    minHeight: 0,
  },
  pre: {
    boxSizing: 'border-box',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 13,
    height: '100%',
    lineHeight: 1.5,
    margin: 0,
    overflowY: 'auto',
    padding: 16,
    tabSize: 2,
  },
  code: {
    display: 'block',
  },
  line: {
    display: 'grid',
    gridTemplateColumns: '4ch minmax(0, 1fr)',
  },
  lineNumber: {
    color: 'var(--color-subtle-text, #73839c)',
    paddingRight: 16,
    textAlign: 'right',
    userSelect: 'none',
  },
  lineCode: {
    minWidth: 0,
  },
  footer: {
    alignItems: 'center',
    borderTop: '1px solid var(--color-border, #d9e2ec)',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 8,
  },
  copyButton: {
    background: 'var(--color-button-background, #ffffff)',
    border: '1px solid var(--color-border, #d9e2ec)',
    borderRadius: 4,
    color: 'var(--color-default-text, #2e3438)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 10px',
  },
} satisfies Record<string, React.CSSProperties>;
