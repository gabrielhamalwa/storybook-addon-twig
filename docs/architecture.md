# Architecture

`storybook-addon-twig` follows the current [Storybook](https://storybook.js.org/) addon package shape:

- `manager.js` and `preview.js` are package-root entry proxies consumed by [Storybook](https://storybook.js.org/).
- `src/preset.ts` injects serialized addon options into manager and preview HTML.
- `src/manager.tsx` registers the `Twig` panel.
- `src/preview.ts` installs optional runtime patching for rendered docs/source code blocks.
- `src/index.ts` exports the CSF preview-addon entry and public TypeScript types.

The addon has two rendering surfaces:

1. The dedicated `Twig` panel reads `parameters.twig.source` and renders it with [Shiki](https://shiki.style/).
2. The preview runtime can patch Storybook-rendered `twig` code blocks in Docs, MDX, and Source blocks.

Runtime patching is isolated in `src/runtime/patchCodeBlocks.ts` because it depends on Storybook's rendered DOM. Projects can turn it off with `patchDocsCodeBlocks: false`.

## Highlighting

Code rendering uses [Shiki](https://shiki.style/) with its bundled `twig` language and a small explicit theme set. Unsupported theme names fall back to `github-dark`.

## Source Text

Source is rendered as provided through `parameters.twig.source`.
