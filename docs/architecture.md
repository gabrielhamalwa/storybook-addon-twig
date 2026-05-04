# Architecture

`storybook-addon-twig` follows the current [Storybook](https://storybook.js.org/) addon package shape:

- `manager.js` and `preview.js` are package-root entry proxies consumed by [Storybook](https://storybook.js.org/).
- `preset.js` is the package-root Storybook preset entry that re-exports the dist preset hooks.
- `src/preset.ts` injects serialized addon options into manager and preview HTML.
- `src/manager.tsx` registers the optional `Twig` panel.
- `src/preview.ts` registers the preview-side runtime patcher for Docs/code blocks.
- `src/runtime/patchDocsCodeBlocks.ts` watches Storybook Docs code surfaces and replaces Twig-tagged blocks with addon-owned highlighted output.
- `src/index.ts` remains a type-only root entry.

Manager and preview runtimes are intentionally separated: panel UI stays in manager code, and docs/source behavior stays in preview code.

The addon has two rendering surfaces:

1. The dedicated `Twig` panel reads `parameters.twig.source` and renders it in the addon panel.
2. The Docs runtime watches Storybook-rendered code blocks in the preview and replaces Twig-tagged surfaces with addon-owned highlighted output.

## Highlighting

Twig highlighting uses a Prism-compatible Twig grammar and registers `twig`, `html.twig`, `html-twig`, and `html+twig` aliases so panel and Docs surfaces share the same language mapping.

Manager-side code rendering uses Storybook's `SyntaxHighlighter` with a bundled Refractor-compatible Twig grammar. Preview-side docs rendering uses a DOM replacement patcher that operates on Storybook's rendered Docs code blocks.

The preview patcher is deliberate. It follows the same high-level approach used by `storybook-addon-shiki`: wait for Storybook Docs to render its default code blocks, then replace matching Twig-tagged blocks with addon-owned output while leaving non-Twig blocks alone.

## Source Text

Source is rendered as provided through `parameters.twig.source`.
