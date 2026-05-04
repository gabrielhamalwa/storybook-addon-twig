import type { Preview } from '@storybook/react-vite';

export const decorators = [];
export const parameters = {};
import './runtime/patchDocsCodeBlocks';

const preview: Preview = {
  decorators,
  parameters,
};

export default preview;
