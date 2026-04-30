import { createHighlighterCore, type HighlighterCore, type ThemeRegistrationRaw } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import css from 'shiki/langs/css.mjs';
import html from 'shiki/langs/html.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import twig from 'shiki/langs/twig.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import darkPlus from 'shiki/themes/dark-plus.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';
import githubLight from 'shiki/themes/github-light.mjs';
import lightPlus from 'shiki/themes/light-plus.mjs';

const THEME_REGISTRY = {
  'dark-plus': darkPlus,
  'github-dark': githubDark,
  'github-light': githubLight,
  'light-plus': lightPlus,
} satisfies Record<string, ThemeRegistrationRaw>;

const DEFAULT_THEME = 'github-light';
type SupportedTheme = keyof typeof THEME_REGISTRY;

const highlighters = new Map<string, Promise<{ highlighter: HighlighterCore; language: 'twig'; theme: string }>>();

export async function getTwigHighlighter(
  theme: string,
): Promise<{ highlighter: HighlighterCore; language: 'twig'; theme: string }> {
  const safeTheme = getSupportedTheme(theme);
  const cacheKey = safeTheme;
  const cached = highlighters.get(cacheKey);

  if (cached) {
    return cached;
  }

  /* v8 ignore start -- Defensive recovery for Shiki initialization failures. */
  const pending = createTwigHighlighter(safeTheme).catch((error: unknown) => {
    highlighters.delete(cacheKey);
    throw error;
  });
  /* v8 ignore stop */
  highlighters.set(cacheKey, pending);
  return pending;
}

export async function renderTwigToHtml(
  code: string,
  options: { theme: string; showLineNumbers: boolean; wrapLines: boolean },
): Promise<string> {
  const { highlighter, language, theme } = await getTwigHighlighter(options.theme);

  return highlighter.codeToHtml(code, {
    lang: language,
    theme,
    transformers: [
      {
        pre(node) {
          this.addClassToHast(node, 'satw-code');
          if (options.showLineNumbers) {
            this.addClassToHast(node, 'satw-code--line-numbers');
          }
          if (options.wrapLines) {
            this.addClassToHast(node, 'satw-code--wrap-lines');
          }
        },
      },
    ],
  });
}

async function createTwigHighlighter(
  theme: SupportedTheme,
): Promise<{ highlighter: HighlighterCore; language: 'twig'; theme: string }> {
  const highlighter = await createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [twig, html, css, javascript, typescript, json, bash],
    themes: [THEME_REGISTRY[theme]],
  });

  return { highlighter, language: 'twig', theme };
}

function getSupportedTheme(theme: string): SupportedTheme {
  return isSupportedTheme(theme) ? theme : DEFAULT_THEME;
}

function isSupportedTheme(theme: string): theme is SupportedTheme {
  return theme in THEME_REGISTRY;
}
