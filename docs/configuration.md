# Configuration

Register the addon from `.storybook/main.ts`:

```ts
export default {
  addons: [
    {
      name: 'storybook-addon-twig',
      options: {
        theme: 'github-dark',
        patchDocsCodeBlocks: true,
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
  theme?: string;
  patchDocsCodeBlocks?: boolean;
  panel?: boolean;
  copy?: boolean;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
};
```

Supported `theme` values are `github-dark`, `github-light`, `dark-plus`, and `light-plus`. Unknown theme names fall back to `github-dark` instead of failing the panel or docs rendering path.

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
