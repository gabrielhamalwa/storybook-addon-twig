import React from 'react';
import { useParameter } from 'storybook/manager-api';

import { PARAM_KEY } from '../constants';
import { collectTwigSource } from '../runtime/collectSource';
import type { TwigAddonOptions, TwigSourceParameter } from '../types';
import { TwigCodeViewer } from './TwigCodeViewer';

type TwigPanelProps = {
  active: boolean;
  options?: TwigAddonOptions;
};

export function TwigPanel({ active, options }: TwigPanelProps) {
  const parameter = useParameter<TwigSourceParameter | undefined>(PARAM_KEY, undefined);
  const source = collectTwigSource(parameter);

  if (!active) {
    return null;
  }

  if (!source) {
    return React.createElement(
      'div',
      { className: 'satw-panel satw-panel--empty' },
      React.createElement('strong', null, 'No Twig source configured'),
      React.createElement(
        'p',
        null,
        'Add ',
        React.createElement('code', null, 'parameters.twig.source'),
        ' to this story.',
      ),
    );
  }

  return React.createElement(TwigCodeViewer, {
    code: source.code,
    fileName: source.fileName,
    options,
    parameter,
  });
}
