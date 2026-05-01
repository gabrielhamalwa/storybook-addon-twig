import React from 'react';
import { addons, types } from 'storybook/manager-api';

import { ADDON_ID, OPTIONS_GLOBAL, PANEL_ID } from './constants';
import { registerTwigLanguageForManager } from './highlight/registerTwigLanguageForManager';
import { normalizeOptions } from './options';
import type { TwigAddonOptions } from './types';
import { TwigPanel } from './panel/TwigPanel';

const globalOptions = typeof window !== 'undefined' ? window[OPTIONS_GLOBAL] : undefined;
const options = normalizeOptions(globalOptions);
registerTwigLanguageForManager();

addons.register(ADDON_ID, () => {
  if (!options.panel) {
    return;
  }

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Twig',
    render: (props) =>
      React.createElement(TwigPanel, {
        ...props,
        options: globalOptions as TwigAddonOptions | undefined,
      }),
  });
});
