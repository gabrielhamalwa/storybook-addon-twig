import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)', '../src/**/*.mdx'],
  addons: [
    '@storybook/addon-docs',
    {
      name: path.resolve(currentDirectory, '../..'),
      options: {
        copy: true,
        docsCodeBlocks: true,
        showLineNumbers: true,
      },
    },
  ],
  framework: '@storybook/react-vite',
};

export default config;
