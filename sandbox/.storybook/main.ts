import type { StorybookConfig } from '@storybook/react-vite';

const docsCodeBlocks = process.env.STORYBOOK_ADDON_TWIG_DOCS !== 'false';
const panel = process.env.STORYBOOK_ADDON_TWIG_PANEL !== 'false';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)', '../src/**/*.mdx'],
  addons: [
    '@storybook/addon-docs',
    {
      name: 'storybook-addon-twig',
      options: {
        copy: true,
        docsCodeBlocks,
        panel,
        showLineNumbers: true,
      },
    },
  ],
  framework: '@storybook/react-vite',
};

export default config;
