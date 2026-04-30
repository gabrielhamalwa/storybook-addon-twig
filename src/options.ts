import type { NormalizedTwigAddonOptions, TwigAddonOptions, TwigSourceParameter } from './types';

export const DEFAULT_OPTIONS: NormalizedTwigAddonOptions = {
  copy: true,
  docsCodeBlocks: true,
  panel: true,
  showLineNumbers: true,
  wrapLines: true,
};

export function normalizeOptions(options: TwigAddonOptions | undefined): NormalizedTwigAddonOptions {
  const { patchDocsCodeBlocks, ...currentOptions } = options ?? {};

  return {
    ...DEFAULT_OPTIONS,
    ...currentOptions,
    docsCodeBlocks: currentOptions.docsCodeBlocks ?? patchDocsCodeBlocks ?? DEFAULT_OPTIONS.docsCodeBlocks,
  };
}

export function mergeSourceOptions(
  options: NormalizedTwigAddonOptions,
  parameter: TwigSourceParameter | undefined,
): NormalizedTwigAddonOptions {
  return {
    ...options,
    copy: parameter?.copy ?? options.copy,
    showLineNumbers: parameter?.showLineNumbers ?? options.showLineNumbers,
    wrapLines: parameter?.wrapLines ?? options.wrapLines,
  };
}
