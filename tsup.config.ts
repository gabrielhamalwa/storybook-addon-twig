import { defineConfig, type Options } from 'tsup';

type BundlerConfig = {
  bundler?: {
    nodeEntries?: string[];
    managerEntries?: string[];
    previewEntries?: string[];
  };
};

export default defineConfig(async () => {
  const packageJson = (await import('./package.json', { with: { type: 'json' } })).default as BundlerConfig;
  const { bundler: { nodeEntries = [], managerEntries = [], previewEntries = [] } = {} } = packageJson;

  const commonConfig: Options = {
    clean: false,
    dts: false,
    external: [/^storybook(\/.*)?$/, /^@storybook\/.*/, /^react(\/.*)?$/, /^react-dom(\/.*)?$/],
    format: ['esm'],
    splitting: true,
    sourcemap: true,
    treeshake: true,
  };

  const configs: Options[] = [];

  if (nodeEntries.length) {
    configs.push({
      ...commonConfig,
      dts: true,
      entry: nodeEntries,
      platform: 'node',
      target: 'node20.19',
    });
  }

  if (managerEntries.length) {
    configs.push({
      ...commonConfig,
      entry: managerEntries,
      platform: 'browser',
      target: 'esnext',
    });
  }

  if (previewEntries.length) {
    configs.push({
      ...commonConfig,
      dts: true,
      entry: previewEntries,
      platform: 'browser',
      target: 'esnext',
    });
  }

  return configs;
});
