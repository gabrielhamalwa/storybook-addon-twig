# storybook-addon-twig

[![CI](https://github.com/gabrielhamalwa/storybook-addon-twig/actions/workflows/ci.yaml/badge.svg)](https://github.com/gabrielhamalwa/storybook-addon-twig/actions/workflows/ci.yaml)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![Storybook](https://img.shields.io/badge/Storybook-%5E10-ff4785)](https://storybook.js.org/)

Twig source and code highlighting for [Storybook](https://storybook.js.org/).

`storybook-addon-twig` registers Twig syntax with Storybook's native Docs code blocks and adds a `Twig` panel for story-level source.

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
        docsCodeBlocks: true,
        showLineNumbers: true,
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

| Option            | Default | Purpose                                                     |
| ----------------- | ------- | ----------------------------------------------------------- |
| `docsCodeBlocks`  | `true`  | Register Twig syntax for Storybook Docs and MDX code blocks |
| `panel`           | `true`  | Register the dedicated `Twig` addon panel                   |
| `copy`            | `true`  | Show copy controls in the Twig panel                        |
| `showLineNumbers` | `true`  | Show line numbers in the Twig panel                         |
| `wrapLines`       | `true`  | Wrap long lines in the Twig panel                           |

The addon uses Storybook's native Docs code blocks for Twig highlighting. The optional manager panel renders story-level Twig source in the addon panel.

## Behavior Notes

- The `Twig` addon panel and Docs code blocks are independent. You can disable the panel with `panel: false` and keep docs highlighting with `docsCodeBlocks: true`.
- Storybook's `Source` block inside `Canvas` is rendered in dark mode by Storybook itself. This addon does not force a dark theme.

## Migration Notes

- `patchDocsCodeBlocks` is removed. Use `docsCodeBlocks`.
- `theme` is not part of this addon's API.

## Troubleshooting

If Storybook fails after upgrading this addon, clear optimize-deps/cache artifacts and restart:

```sh
rm -rf node_modules/.cache/storybook node_modules/.vite
```

## Development

This repo is [Bun](https://bun.sh/)-first:

```shell
bun install
bun run build
bun run check:package
bun run coverage
bun run lint
bun run format:check
cd sandbox && bun run build-storybook
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
