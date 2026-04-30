import { definePreviewAddon } from 'storybook/internal/csf';

import * as preview from './preview';

export type { TwigAddonOptions, TwigParameters, TwigSourceParameter } from './types';

export default function twigAddon() {
  return definePreviewAddon(preview);
}
