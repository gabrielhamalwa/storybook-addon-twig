export type TwigAddonOptions = {
  docsCodeBlocks?: boolean;
  panel?: boolean;
  copy?: boolean;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
};

export type TwigSourceParameter = {
  source?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  copy?: boolean;
};

export type TwigParameters = {
  twig?: TwigSourceParameter;
};

export type NormalizedTwigAddonOptions = {
  docsCodeBlocks: boolean;
  panel: boolean;
  copy: boolean;
  showLineNumbers: boolean;
  wrapLines: boolean;
};

declare global {
  interface Window {
    __STORYBOOK_ADDON_TWIG_OPTIONS__?: TwigAddonOptions;
  }
}
