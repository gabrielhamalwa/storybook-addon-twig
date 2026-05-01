/* eslint-disable @typescript-eslint/no-explicit-any */
import { TWIG_LANGUAGE_ALIASES } from './twigLanguage';

type PrismLike = {
  languages: Record<string, unknown>;
  hooks?: {
    add: (name: string, callback: (env: unknown) => void) => void;
  };
};

let registered = false;

export function registerTwigLanguage(): void {
  if (registered) {
    return;
  }

  const prism = getPrism();
  if (!prism) {
    return;
  }

  if (!prism.languages.twig) {
    twig(prism);
  }

  for (const alias of TWIG_LANGUAGE_ALIASES) {
    prism.languages[alias] = prism.languages.twig;
  }

  registered = true;
}

function getPrism(): PrismLike | undefined {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  const candidate = (globalThis as { Prism?: unknown }).Prism;
  if (!candidate || typeof candidate !== 'object') {
    return undefined;
  }

  const prism = candidate as PrismLike;
  if (!prism.languages || typeof prism.languages !== 'object') {
    return undefined;
  }

  return prism;
}

/* v8 ignore start -- Refractor-compatible Twig and markup-templating grammars. */
const markupTemplating = function markupTemplatingGrammar(Prism: any): void {
  function getPlaceholder(language: string, index: string | number): string {
    return `___${language.toUpperCase()}${index}___`;
  }

  Object.defineProperties((Prism.languages['markup-templating'] = {}), {
    buildPlaceholders: {
      value(env: any, language: string, placeholderPattern: RegExp, replaceFilter?: (match: string) => boolean) {
        if (env.language !== language) {
          return;
        }

        const tokenStack: string[] = (env.tokenStack = []);
        env.code = env.code.replace(placeholderPattern, (match: string) => {
          if (typeof replaceFilter === 'function' && !replaceFilter(match)) {
            return match;
          }

          let index = tokenStack.length;
          let placeholder = getPlaceholder(language, index);

          while (env.code.includes(placeholder)) {
            index += 1;
            placeholder = getPlaceholder(language, index);
          }

          tokenStack[index] = match;
          return placeholder;
        });

        env.grammar = Prism.languages.markup;
      },
    },
    tokenizePlaceholders: {
      value(env: any, language: string) {
        if (env.language !== language || !env.tokenStack) {
          return;
        }

        env.grammar = Prism.languages[language];
        let tokenIndex = 0;
        const tokenKeys = Object.keys(env.tokenStack);

        function walkTokens(tokens: any[]): any[] {
          for (let index = 0; index < tokens.length; index += 1) {
            if (tokenIndex >= tokenKeys.length) {
              break;
            }

            const token = tokens[index];
            if (typeof token === 'string' || (token.content && typeof token.content === 'string')) {
              const key = tokenKeys[tokenIndex];
              const source = env.tokenStack[key];
              const text = typeof token === 'string' ? token : token.content;
              const placeholder = getPlaceholder(language, key);
              const placeholderIndex = text.indexOf(placeholder);

              if (placeholderIndex > -1) {
                tokenIndex += 1;

                const before = text.substring(0, placeholderIndex);
                const middle = new Prism.Token(language, Prism.tokenize(source, env.grammar), `language-${language}`, source);
                const after = text.substring(placeholderIndex + placeholder.length);
                const replacement = [];

                if (before) {
                  replacement.push(...walkTokens([before]));
                }

                replacement.push(middle);

                if (after) {
                  replacement.push(...walkTokens([after]));
                }

                if (typeof token === 'string') {
                  tokens.splice(index, 1, ...replacement);
                } else {
                  token.content = replacement;
                }
              }
            } else if (token.content) {
              walkTokens(token.content);
            }
          }

          return tokens;
        }

        walkTokens(env.tokens);
      },
    },
  });
};

const twig = function twigGrammar(Prism: any): void {
  if (typeof Prism.register === 'function') {
    Prism.register(markupTemplating);
  } else {
    markupTemplating(Prism);
  }

  Prism.languages.twig = {
    comment: /^\{#[\s\S]*?#\}$/,
    'tag-name': {
      alias: 'keyword',
      lookbehind: true,
      pattern: /(^\{%-?\s*)\w+/,
    },
    delimiter: {
      alias: 'punctuation',
      pattern: /^\{[{%]-?|-?[%}]\}$/,
    },
    string: {
      inside: {
        punctuation: /^['"]|['"]$/,
      },
      pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
    },
    keyword: /\b(?:even|if|odd)\b/,
    boolean: /\b(?:false|null|true)\b/,
    number: /\b0x[\dA-Fa-f]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][-+]?\d+)?/,
    operator: [
      {
        lookbehind: true,
        pattern: /(\s)(?:and|b-and|b-or|b-xor|ends with|in|is|matches|not|or|same as|starts with)(?=\s)/,
      },
      /[=<>]=?|!=|\*\*?|\/\/?|\?:?|[-+~%|]/,
    ],
    punctuation: /[()[\]{}:.,]/,
  };

  Prism.hooks?.add('before-tokenize', (env: any) => {
    if (env.language !== 'twig') {
      return;
    }

    Prism.languages['markup-templating'].buildPlaceholders(
      env,
      'twig',
      /\{(?:#[\s\S]*?#|%[\s\S]*?%|\{[\s\S]*?\})\}/g,
    );
  });

  Prism.hooks?.add('after-tokenize', (env: any) => {
    Prism.languages['markup-templating'].tokenizePlaceholders(env, 'twig');
  });
};
/* v8 ignore stop */
