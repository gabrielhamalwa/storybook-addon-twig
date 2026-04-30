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

The dedicated Twig panel uses Storybook's native code viewer. Storybook controls the visual theme for both the panel and Docs code blocks.

`patchDocsCodeBlocks` is still accepted as a compatibility alias for `docsCodeBlocks`.

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
