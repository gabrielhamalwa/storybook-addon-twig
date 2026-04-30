# Architecture

`storybook-addon-twig` follows the current [Storybook](https://storybook.js.org/) addon package shape:

- `manager.js` and `preview.js` are package-root entry proxies consumed by [Storybook](https://storybook.js.org/).
- `src/preset.ts` injects serialized addon options into manager and preview HTML.
- `src/manager.tsx` registers the `Twig` panel and Twig syntax for manager-rendered code.
- `src/preview.ts` registers Twig syntax for preview-rendered Docs and MDX code.
- `src/index.ts` exports the CSF preview-addon entry and public TypeScript types.

The addon has two rendering surfaces:

1. The dedicated `Twig` panel reads `parameters.twig.source` and renders it with Storybook's native code viewer.
2. Storybook's Docs runtime renders MDX and Source code blocks with the registered Twig grammar.

## Highlighting

Twig highlighting uses [Refractor](https://github.com/wooorm/refractor)'s Prism-compatible Twig grammar registered through Storybook's `SyntaxHighlighter.registerLanguage` API.

## Source Text

Source is rendered as provided through `parameters.twig.source`.
