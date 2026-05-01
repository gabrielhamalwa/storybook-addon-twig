/* eslint-disable @typescript-eslint/no-explicit-any, no-useless-escape */
type PrismLike = {
  Token: new (type: string, content: unknown, alias?: string, matchedStr?: string) => unknown;
  hooks: { add: (name: string, callback: (env: any) => void) => void };
  languages: Record<string, any> & {
    extend: (id: string, redef: Record<string, unknown>) => unknown;
    insertBefore: (inside: string, before: string, insert: Record<string, unknown>) => void;
  };
  register: (language: (prism: PrismLike) => void) => void;
  tokenize: (code: string, grammar: unknown) => unknown;
};

function markup(Prism: PrismLike): void {
  Prism.languages.markup = {
    comment: { pattern: /<!--(?:(?!<!--)[\s\S])*?-->/, greedy: true },
    prolog: { pattern: /<\?[\s\S]+?\?>/, greedy: true },
    doctype: {
      pattern:
        /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
      greedy: true,
      inside: {
        'internal-subset': {
          pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
          lookbehind: true,
          greedy: true,
          inside: null,
        },
        string: { pattern: /"[^"]*"|'[^']*'/, greedy: true },
        punctuation: /^<!|>$|[[\]]/,
        'doctype-tag': /^DOCTYPE/i,
        name: /[^\s<>'"]+/,
      },
    },
    cdata: { pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i, greedy: true },
    tag: {
      pattern:
        /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
      greedy: true,
      inside: {
        tag: { pattern: /^<\/?[^\s>\/]+/, inside: { punctuation: /^<\/?/, namespace: /^[^\s>\/:]+:/ } },
        'special-attr': [],
        'attr-value': {
          pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
          inside: {
            punctuation: [
              { pattern: /^=/, alias: 'attr-equals' },
              { pattern: /^(\s*)["']|["']$/, lookbehind: true },
            ],
          },
        },
        punctuation: /\/?>/,
        'attr-name': { pattern: /[^\s>\/]+/, inside: { namespace: /^[^\s>\/:]+:/ } },
      },
    },
    entity: [{ pattern: /&[\da-z]{1,8};/i, alias: 'named-entity' }, /&#x?[\da-f]{1,8};/i],
  };
  Prism.languages.markup.tag.inside['attr-value'].inside.entity = Prism.languages.markup.entity;
  Prism.languages.markup.doctype.inside['internal-subset'].inside = Prism.languages.markup;
  Prism.languages.html = Prism.languages.markup;
  Prism.languages.mathml = Prism.languages.markup;
  Prism.languages.svg = Prism.languages.markup;
  Prism.languages.xml = Prism.languages.extend('markup', {});
  Prism.languages.ssml = Prism.languages.xml;
  Prism.languages.atom = Prism.languages.xml;
  Prism.languages.rss = Prism.languages.xml;
}

markup.displayName = 'markup';
markup.aliases = ['atom', 'html', 'mathml', 'rss', 'ssml', 'svg', 'xml'];

function markupTemplating(Prism: PrismLike): void {
  Prism.register(markup);
  function placeholder(language: string, index: number): string {
    return `___${language.toUpperCase()}${index}___`;
  }
  Object.defineProperties((Prism.languages['markup-templating'] = {}), {
    buildPlaceholders: {
      value: (env: any, language: string, pattern: RegExp) => {
        if (env.language !== language) {
          return;
        }
        const stack: string[] = (env.tokenStack = []);
        env.code = env.code.replace(pattern, (match: string) => {
          let i = stack.length;
          let key = placeholder(language, i);
          while (env.code.indexOf(key) !== -1) {
            i += 1;
            key = placeholder(language, i);
          }
          stack[i] = match;
          return key;
        });
        env.grammar = Prism.languages.markup;
      },
    },
    tokenizePlaceholders: {
      value: (env: any, language: string) => {
        if (env.language !== language || !env.tokenStack) {
          return;
        }
        env.grammar = Prism.languages[language];
        let j = 0;
        const keys = Object.keys(env.tokenStack);
        function walk(tokens: any[]): any[] {
          for (let i = 0; i < tokens.length && j < keys.length; i += 1) {
            const token = tokens[i];
            if (typeof token === 'string' || (token.content && typeof token.content === 'string')) {
              const key = keys[j];
              const text = env.tokenStack[key];
              const content = typeof token === 'string' ? token : token.content;
              const needle = placeholder(language, Number(key));
              const idx = content.indexOf(needle);
              if (idx > -1) {
                j += 1;
                const before = content.slice(0, idx);
                const middle = new Prism.Token(
                  language,
                  Prism.tokenize(text, env.grammar),
                  `language-${language}`,
                  text,
                );
                const after = content.slice(idx + needle.length);
                const replacement: any[] = [];
                if (before) {
                  replacement.push(...walk([before]));
                }
                replacement.push(middle);
                if (after) {
                  replacement.push(...walk([after]));
                }
                if (typeof token === 'string') {
                  tokens.splice(i, 1, ...replacement);
                } else {
                  token.content = replacement;
                }
              }
            } else if (token.content) {
              walk(token.content);
            }
          }
          return tokens;
        }
        walk(env.tokens);
      },
    },
  });
}

(markupTemplating as unknown as { displayName: string }).displayName = 'markup-templating';
(markupTemplating as unknown as { aliases: string[] }).aliases = [];

function refractorTwig(Prism: PrismLike): void {
  Prism.register(markupTemplating);
  Prism.languages.twig = {
    comment: /^\{#[\s\S]*?#\}$/,
    'tag-name': { pattern: /(^\{%-?\s*)\w+/, lookbehind: true, alias: 'keyword' },
    delimiter: { pattern: /^\{[{%]-?|-?[%}]\}$/, alias: 'punctuation' },
    string: { pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/, inside: { punctuation: /^['"]|['"]$/ } },
    keyword: /\b(?:even|if|odd)\b/,
    boolean: /\b(?:false|null|true)\b/,
    number: /\b0x[\dA-Fa-f]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][-+]?\d+)?/,
    operator: [
      {
        pattern: /(\s)(?:and|b-and|b-or|b-xor|ends with|in|is|matches|not|or|same as|starts with)(?=\s)/,
        lookbehind: true,
      },
      /[=<>]=?|!=|\*\*?|\/\/?|\?:?|[-+~%|]/,
    ],
    punctuation: /[()\[\]{}:.,]/,
  };
  Prism.hooks.add('before-tokenize', (env: any) => {
    if (env.language === 'twig') {
      Prism.languages['markup-templating'].buildPlaceholders(
        env,
        'twig',
        /\{(?:#[\s\S]*?#|%[\s\S]*?%|\{[\s\S]*?\})\}/g,
      );
    }
  });
  Prism.hooks.add('after-tokenize', (env: any) => {
    Prism.languages['markup-templating'].tokenizePlaceholders(env, 'twig');
  });
}

(refractorTwig as unknown as { displayName: string }).displayName = 'twig';
(refractorTwig as unknown as { aliases: string[] }).aliases = [];

export { refractorTwig };
