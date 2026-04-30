# storybook-addon-twig

[![CI](https://github.com/gabrielhamalwa/storybook-addon-twig/actions/workflows/ci.yaml/badge.svg)](https://github.com/gabrielhamalwa/storybook-addon-twig/actions/workflows/ci.yaml)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![Storybook](https://img.shields.io/badge/Storybook-%5E10-ff4785)](https://storybook.js.org/)

Twig source and code display for [Storybook](https://storybook.js.org/).

`storybook-addon-twig` adds a `Twig` panel for story-level source and re-highlights Twig code blocks rendered by Storybook Docs.

## Install

```shell
bun add -d storybook-addon-twig
```

> [!NOTE]
> This package is designed for Storybook 10.

Register the addon:

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  addons: [
    {
      name: 'storybook-addon-twig',
      options: {
        copy: true,
        patchDocsCodeBlocks: true,
        showLineNumbers: true,
        theme: 'github-light',
      },
    },
  ],
};

export default config;
```

Add source to a story:

```ts
export const Default = {
  parameters: {
    twig: {
      fileName: 'button.html.twig',
      source: "{% include 'button.html.twig' with { label: 'Save' } %}",
    },
  },
};
```

> [!TIP]
> `source` is displayed exactly as provided. Pass formatted Twig when you want the panel and Docs output to preserve project formatting.

## Options

| Option                | Default        | Purpose                                                                              |
| --------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `theme`               | `github-light` | Supported bundled theme: `github-light`, `github-dark`, `light-plus`, or `dark-plus` |
| `patchDocsCodeBlocks` | `true`         | Re-highlight rendered Storybook `twig` docs/source blocks                            |
| `panel`               | `true`         | Register the dedicated `Twig` addon panel                                            |
| `copy`                | `true`         | Show copy controls in the Twig panel                                                 |
| `showLineNumbers`     | `true`         | Show line numbers in addon-rendered code                                             |
| `wrapLines`           | `true`         | Wrap long lines in addon-rendered code                                               |

The addon keeps code backgrounds transparent so Storybook controls the surrounding Source block styling. Unsupported theme names fall back to `github-light` to keep addon rendering stable.

## Development

This repo is [Bun](https://bun.sh/)-first:

```shell
bun install
bun run build
bun run test
bun run lint
bun run format:check
bun run storybook
```

The sandbox [Storybook](https://storybook.js.org/) lives in `sandbox/` and resolves the parent addon package directly from its Storybook config.

## Documentation

| Topic           | Page                                           |
| --------------- | ---------------------------------------------- |
| Configuration   | [docs/configuration.md](docs/configuration.md) |
| Architecture    | [docs/architecture.md](docs/architecture.md)   |
| Sandbox         | [docs/sandbox.md](docs/sandbox.md)             |
| Testing         | [docs/testing.md](docs/testing.md)             |
| Release process | [docs/release.md](docs/release.md)             |
| Contributing    | [CONTRIBUTING.md](CONTRIBUTING.md)             |

## License

[MIT](LICENSE)
