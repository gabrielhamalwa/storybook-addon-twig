# storybook-addon-twig

[![CI](https://github.com/gabrielhamalwa/storybook-addon-twig/actions/workflows/ci.yaml/badge.svg)](https://github.com/gabrielhamalwa/storybook-addon-twig/actions/workflows/ci.yaml)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![Storybook](https://img.shields.io/badge/Storybook-%5E10-ff4785)](https://storybook.js.org/)

Twig source and code highlighting for [Storybook](https://storybook.js.org/).

`storybook-addon-twig` adds a `Twig` panel for story-level source and patches Storybook Docs code blocks in the preview runtime so Twig MDX fences and explicit Twig `Source` blocks render through the same Twig highlighter.

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

| Option            | Default | Purpose                                                                |
| ----------------- | ------- | ---------------------------------------------------------------------- |
| `docsCodeBlocks`  | `true`  | Enable preview-side Twig docs patching for Twig docs/source blocks      |
| `panel`           | `true`  | Register the dedicated `Twig` addon panel                              |
| `copy`            | `true`  | Enable copy actions for addon-owned Twig code surfaces                 |
| `showLineNumbers` | `true`  | Show line numbers in addon-owned Twig code surfaces                    |
| `wrapLines`       | `true`  | Wrap long lines in addon-owned Twig code surfaces                      |

With `docsCodeBlocks: true`, the addon owns Twig rendering for these Docs paths:

- fenced MDX blocks such as ` ```twig ` and ` ```html.twig `
- explicit `<Source language="twig" />` blocks
- the optional `Twig` manager panel

## Behavior Notes

- The `Twig` addon panel and Docs code blocks are independent. You can disable the panel with `panel: false` and keep docs highlighting with `docsCodeBlocks: true`.
- Storybook's `Source` block inside `Canvas` remains Storybook-owned unless you explicitly set a Twig language on the docs/source block.
- The sync icon in the panel toolbar triggers a Storybook `FORCE_RE_RENDER` refresh for the current story.

## Docs Behavior

Docs highlighting is automatic when the addon is registered and `docsCodeBlocks` is enabled.

The preview runtime watches Storybook's Docs code surfaces and replaces Twig-tagged blocks with addon-owned highlighted output. This is the same category of runtime approach used by addons such as `@lukethacoder/storybook-addon-shiki`, and it avoids relying on Storybook-internal docs component aliasing.

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
