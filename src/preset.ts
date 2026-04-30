import { OPTIONS_GLOBAL } from './constants';
import type { TwigAddonOptions } from './types';

export function managerHead(head = '', options?: TwigAddonOptions): string {
  return `${head}\n${createOptionsScript(options)}`;
}

export function previewHead(head = '', options?: TwigAddonOptions): string {
  return `${head}\n${createOptionsScript(options)}`;
}

function createOptionsScript(options: TwigAddonOptions | undefined): string {
  const serialized = JSON.stringify(options ?? {}).replaceAll('<', '\\u003c');
  return `<script>window.${OPTIONS_GLOBAL} = ${serialized};</script>`;
}
