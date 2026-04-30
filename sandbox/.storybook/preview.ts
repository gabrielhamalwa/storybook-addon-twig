import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    docs: {
      source: {
        type: 'dynamic',
      },
    },
  },
};

export default preview;
