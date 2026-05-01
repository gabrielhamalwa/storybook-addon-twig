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

Storybook controls the visual theme for Docs code blocks. The dedicated Twig panel follows the manager theme and uses the same source options.

The panel and Docs support are independent:

- Keep only docs highlighting: `docsCodeBlocks: true`, `panel: false`
- Keep only panel: `docsCodeBlocks: false`, `panel: true`

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

Story-level values override the matching global display options for the Twig panel.

## Panel actions

- `copy` toggles visibility of the `Copy` toolbar action in the `Twig` panel.
- The sync icon in the panel toolbar refreshes the current story render (`FORCE_RE_RENDER`).
