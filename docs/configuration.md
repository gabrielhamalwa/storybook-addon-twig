# Configuration

Register the addon from `.storybook/main.ts`:

```ts
export default {
  addons: [
    {
      name: 'storybook-addon-twig',
      options: {
        docsCodeBlocks: true,
        copy: true,
        showLineNumbers: true,
      },
    },
  ],
};
```

## Addon options

```ts
export type TwigAddonOptions = {
  docsCodeBlocks?: boolean;
  panel?: boolean;
  copy?: boolean;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
};
```

Storybook controls the visual theme. This addon patches Twig docs/source blocks in the preview runtime so Twig fences and explicit Twig `Source` blocks render through the addon highlighter, while the dedicated panel follows the manager theme.

The panel and Docs support are independent:

- Keep only docs highlighting: `docsCodeBlocks: true`, `panel: false`
- Keep only panel: `docsCodeBlocks: false`, `panel: true`

## Docs patching

No extra preview wiring is required. When `docsCodeBlocks` is enabled, the addon's preview runtime watches Storybook Docs code surfaces and replaces Twig-tagged blocks.

Supported docs languages:

- `twig`
- `html.twig`
- `html-twig`
- `html+twig`

## Migration

- `patchDocsCodeBlocks` was removed. Use `docsCodeBlocks`.
- `theme` is not an addon option.

## Story parameters

```ts
export const Default = {
  parameters: {
    twig: {
      fileName: 'button.html.twig',
      source: "{% include 'button.html.twig' with { label: 'Save' } %}",
      showLineNumbers: true,
      wrapLines: true,
      copy: true,
    },
  },
};
```

Story-level values override the matching global display options for the Twig panel. Docs blocks use the addon-wide `copy`, `showLineNumbers`, and `wrapLines` settings.

## Panel actions

- `copy` toggles copy actions for addon-owned Twig code surfaces.
- The sync icon in the panel toolbar refreshes the current story render (`FORCE_RE_RENDER`).
