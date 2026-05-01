import React from 'react';
import { SyntaxHighlighter } from 'storybook/internal/components';
import type { SupportedLanguage } from 'storybook/internal/components';

type TwigCodeViewerProps = {
  code: string;
  showLineNumbers: boolean;
  wrapLines: boolean;
};

export function TwigCodeViewer({ code, showLineNumbers, wrapLines }: TwigCodeViewerProps): React.ReactElement {
  return React.createElement(
    SyntaxHighlighter,
    {
      bordered: false,
      copyable: false,
      customStyle: styles.codeContainer,
      format: false,
      language: 'twig' as SupportedLanguage,
      padded: true,
      showLineNumbers,
      wrapLongLines: wrapLines,
    },
    code,
  );
}

const styles = {
  codeContainer: {
    height: '100%',
    margin: 0,
    minHeight: '100%',
  },
} satisfies Record<string, React.CSSProperties>;
