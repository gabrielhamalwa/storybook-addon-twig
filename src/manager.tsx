import { addons, types } from 'storybook/manager-api';

import { ADDON_ID, OPTIONS_GLOBAL, PANEL_ID } from './constants';
import { normalizeOptions } from './options';
import { TwigPanel } from './panel/TwigPanel';
import { installAddonStyles } from './styles';
import type { TwigAddonOptions } from './types';

const globalOptions = typeof window !== 'undefined' ? window[OPTIONS_GLOBAL] : undefined;
const options = normalizeOptions(globalOptions);

if (typeof document !== 'undefined') {
  installAddonStyles(document);
}

addons.register(ADDON_ID, () => {
  if (!options.panel) {
    return;
  }

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Twig',
    render: ({ active }) => (
      <TwigPanel active={Boolean(active)} options={globalOptions as TwigAddonOptions | undefined} />
    ),
  });
});
