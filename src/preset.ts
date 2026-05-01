import { OPTIONS_GLOBAL } from './constants';
import type { TwigAddonOptions } from './types';

const OPTION_KEYS = ['copy', 'docsCodeBlocks', 'panel', 'patchDocsCodeBlocks', 'showLineNumbers', 'wrapLines'] as const;

export function managerHead(head = '', options?: unknown): string {
  return `${head}\n${createOptionsScript(options)}`;
}

export function previewHead(head = '', options?: unknown): string {
  return `${head}\n${createOptionsScript(options)}`;
}

function createOptionsScript(options: unknown): string {
  const serialized = JSON.stringify(pickAddonOptions(options)).replaceAll('<', '\\u003c');
  return `<script>window.${OPTIONS_GLOBAL} = ${serialized};</script>`;
}

function pickAddonOptions(options: unknown): TwigAddonOptions {
  if (!options || typeof options !== 'object') {
    return {};
  }

  const source = options as Record<string, unknown>;
  const picked: Record<string, boolean> = {};

  for (const key of OPTION_KEYS) {
    if (typeof source[key] === 'boolean') {
      picked[key] = source[key];
    }
  }

  return picked;
}
