# Architecture

`storybook-addon-twig` follows the current [Storybook](https://storybook.js.org/) addon package shape:

- `manager.js` and `preview.js` are package-root entry proxies consumed by [Storybook](https://storybook.js.org/).
- `src/preset.ts` injects serialized addon options into manager and preview HTML.
- `src/manager.tsx` registers the optional `Twig` panel.
- `src/preview.ts` registers Twig syntax for preview-rendered Docs and MDX code.
- `src/index.ts` is a type-only public entry. Runtime Storybook integration goes through the preset, manager, and preview entries.

Manager and preview runtimes are intentionally separated: panel UI stays in manager code, and docs/source behavior stays in preview code.

The addon has two rendering surfaces:

1. The dedicated `Twig` panel reads `parameters.twig.source` and renders it in the addon panel.
2. Storybook's Docs runtime renders MDX and Source code blocks with the registered Twig grammar.

## Highlighting

Twig highlighting uses a Prism-compatible Twig grammar and registers `twig`, `html.twig`, and `html-twig` aliases so MDX fences and Storybook Source blocks share the same grammar.

## Source Text

Source is rendered as provided through `parameters.twig.source`.
