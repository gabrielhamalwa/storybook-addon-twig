import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: [
        'src/constants.ts',
        'src/highlight/**/*.ts',
        'src/manager.tsx',
        'src/options.ts',
        'src/panel/**/*.tsx',
        'src/preset.ts',
        'src/preview.ts',
        'src/runtime/**/*.ts',
        'src/styles.ts',
      ],
      reporter: ['text', 'json-summary'],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
