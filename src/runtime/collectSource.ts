import type { TwigSourceParameter } from '../types';

export type CollectedTwigSource = {
  code: string;
  fileName?: string;
};

export function collectTwigSource(parameter: TwigSourceParameter | undefined): CollectedTwigSource | undefined {
  const source = parameter?.source;

  if (typeof source !== 'string') {
    return undefined;
  }

  return {
    code: source,
    fileName: parameter?.fileName,
  };
}
