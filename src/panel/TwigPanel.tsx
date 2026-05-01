import React from 'react';
import { useParameter } from 'storybook/manager-api';

import { PARAM_KEY } from '../constants';
import { collectTwigSource } from '../runtime/collectSource';
import type { TwigAddonOptions, TwigSourceParameter } from '../types';
import { TwigCodeViewer } from './TwigCodeViewer';

type TwigPanelProps = {
  active?: boolean;
  options?: TwigAddonOptions;
};

export function TwigPanel({ active, options }: TwigPanelProps): React.ReactElement {
  const parameter = useParameter<TwigSourceParameter | undefined>(PARAM_KEY, undefined);
  const source = collectTwigSource(parameter);

  const content = source
    ? React.createElement(TwigCodeViewer, {
        code: source.code,
        options,
        parameter,
      })
    : React.createElement(
        'div',
        { style: styles.emptyState },
        React.createElement('h3', { style: styles.emptyTitle }, 'No Twig source configured'),
        React.createElement(
          'p',
          { style: styles.emptyDescription },
          'Add ',
          React.createElement('code', null, 'parameters.twig.source'),
          ' to this story.',
        ),
      );

  return React.createElement(
    'div',
    {
      'aria-hidden': !active,
      hidden: !active,
      style: styles.panel,
    },
    content,
  );
}

const styles = {
  panel: {
    background: 'var(--color-background, transparent)',
    color: 'var(--color-default-text, inherit)',
    height: '100%',
    minHeight: 0,
  },
  emptyState: {
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    padding: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    margin: '0 0 8px',
  },
  emptyDescription: {
    color: 'var(--color-subtle-text, #73839c)',
    fontSize: 13,
    margin: 0,
  },
} satisfies Record<string, React.CSSProperties>;
