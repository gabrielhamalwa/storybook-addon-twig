import { useEffect, useMemo, useRef, useState } from 'react';

import { renderTwigToHtml } from '../highlight/createHighlighter';
import { mergeSourceOptions, normalizeOptions } from '../options';
import { copyText } from '../runtime/copy';
import type { TwigAddonOptions, TwigSourceParameter } from '../types';

type TwigCodeViewerProps = {
  code: string;
  fileName?: string;
  options?: TwigAddonOptions;
  parameter?: TwigSourceParameter;
};

export function TwigCodeViewer({ code, fileName, options, parameter }: TwigCodeViewerProps) {
  const resolvedOptions = useMemo(() => mergeSourceOptions(normalizeOptions(options), parameter), [options, parameter]);
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const resetCopiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function renderCode() {
      setHtml('');

      let rendered: string;

      try {
        rendered = await renderTwigToHtml(code, resolvedOptions);
      } catch {
        rendered = renderPlainCodeFallback(code, resolvedOptions);
      }

      if (!cancelled) {
        setHtml(rendered);
      }
    }

    void renderCode();

    return () => {
      cancelled = true;
    };
  }, [code, resolvedOptions]);

  useEffect(() => {
    return () => {
      if (resetCopiedTimer.current !== undefined) {
        window.clearTimeout(resetCopiedTimer.current);
      }
    };
  }, []);

  async function handleCopy() {
    const didCopy = await copyText(code, navigator.clipboard, document);
    setCopied(didCopy);

    if (!didCopy) {
      return;
    }

    if (resetCopiedTimer.current !== undefined) {
      window.clearTimeout(resetCopiedTimer.current);
    }

    resetCopiedTimer.current = window.setTimeout(() => {
      setCopied(false);
      resetCopiedTimer.current = undefined;
    }, 1600);
  }

  return (
    <section className="satw-panel">
      <header className="satw-panel__header">
        <div>
          <strong>Twig</strong>
          {fileName ? <span className="satw-panel__file">{fileName}</span> : null}
        </div>
        {resolvedOptions.copy ? (
          <button className="satw-panel__button" type="button" aria-label="Copy Twig source" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        ) : null}
      </header>
      <div className="satw-panel__code" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

function renderPlainCodeFallback(
  code: string,
  options: Pick<TwigAddonOptions, 'showLineNumbers' | 'wrapLines'>,
): string {
  const classes = ['satw-code', 'satw-code--fallback'];

  if (options.showLineNumbers) {
    classes.push('satw-code--line-numbers');
  }

  if (options.wrapLines) {
    classes.push('satw-code--wrap-lines');
  }

  return `<pre class="${classes.join(' ')}"><code>${renderFallbackLines(code)}</code></pre>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderFallbackLines(code: string): string {
  return code
    .split('\n')
    .map((line) => `<span class="line">${escapeHtml(line)}</span>`)
    .join('\n');
}
