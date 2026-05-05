/**
 * Utilities for generating Twig source snippets for Storybook stories.
 *
 * These helpers do not render Twig and do not depend on Storybook runtime
 * modules. They only build formatted Twig strings and `parameters.twig`
 * objects that can be consumed by storybook-addon-twig panels/docs.
 */

import type { TwigSourceParameter } from './types';

export type TwigValue = string | number | boolean | null | undefined | TwigValue[] | { [key: string]: TwigValue };

export type TwigIncludeSourceOptions = {
  template: string;
  args?: Record<string, TwigValue>;
  only?: boolean;
};

export type TwigIncludeSourceParametersOptions = TwigIncludeSourceOptions & {
  fileName?: string;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  copy?: boolean;
};

const escapeTwigString = (value: string): string => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export function toTwigValue(value: TwigValue): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'string') {
    return `'${escapeTwigString(value)}'`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => toTwigValue(item)).join(', ')}]`;
  }

  const entries = Object.entries(value).map(([key, entryValue]) => {
    const renderedKey = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : `'${escapeTwigString(key)}'`;

    return `${renderedKey}: ${toTwigValue(entryValue)}`;
  });

  return `{ ${entries.join(', ')} }`;
}

export function buildTwigIncludeSource({ template, args = {}, only = true }: TwigIncludeSourceOptions): string {
  const entries = Object.entries(args);

  if (entries.length === 0) {
    return `{% include '${escapeTwigString(template)}'${only ? ' only' : ''} %}`;
  }

  const lines = [`{% include '${escapeTwigString(template)}' with {`];

  entries.forEach(([key, value]) => {
    lines.push(`  ${key}: ${toTwigValue(value)},`);
  });

  lines.push(`}${only ? ' only' : ''} %}`);

  return lines.join('\n');
}

export function buildTwigSourceParameters({
  template,
  args,
  only,
  fileName,
  showLineNumbers,
  wrapLines,
  copy,
}: TwigIncludeSourceParametersOptions): TwigSourceParameter {
  return {
    fileName: fileName ?? template.split('/').at(-1),
    source: buildTwigIncludeSource({ template, args, only }),
    showLineNumbers,
    wrapLines,
    copy,
  };
}
