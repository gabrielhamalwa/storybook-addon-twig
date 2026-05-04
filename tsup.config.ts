import { defineConfig, type Options } from 'tsup';

type BundlerConfig = {
  bundler?: {
    exportEntries?: string[];
    nodeEntries?: string[];
    managerEntries?: string[];
    previewEntries?: string[];
  };
};

export default defineConfig(async () => {
  const packageJson = (await import('./package.json', { with: { type: 'json' } })).default as BundlerConfig;
  const { bundler: { exportEntries = [], nodeEntries = [], managerEntries = [], previewEntries = [] } = {} } =
    packageJson;

  const commonConfig: Options = {
    clean: false,
    dts: false,
    external: [/^storybook(\/.*)?$/, /^@storybook\/.*/, /^react(\/.*)?$/, /^react-dom(\/.*)?$/],
    format: ['esm'],
    noExternal: ['refractor'],
    skipNodeModulesBundle: false,
    splitting: true,
    sourcemap: false,
    treeshake: true,
  };

  const configs: Options[] = [];

  if (exportEntries.length) {
    configs.push({
      ...commonConfig,
      dts: true,
      entry: exportEntries,
      platform: 'browser',
      target: 'esnext',
    });
  }

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
      splitting: false,
      target: 'esnext',
    });
  }

  return configs;
});
