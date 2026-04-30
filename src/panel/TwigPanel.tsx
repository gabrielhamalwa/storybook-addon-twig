import React from 'react';
import { useParameter } from 'storybook/manager-api';
import { AddonPanel, EmptyTabContent } from 'storybook/internal/components';

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
    : React.createElement(EmptyTabContent, {
        description: React.createElement(
          React.Fragment,
          null,
          'Add ',
          React.createElement('code', null, 'parameters.twig.source'),
          ' to this story.',
        ),
        title: 'No Twig source configured',
      });

  return React.createElement(AddonPanel, { active: Boolean(active), children: content });
}
