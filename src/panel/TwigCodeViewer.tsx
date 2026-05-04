import React from 'react';
import { SyntaxHighlighter } from 'storybook/internal/components';
import type { SupportedLanguage } from 'storybook/internal/components';

type TwigCodeViewerProps = {
  code: string;
  showLineNumbers: boolean;
  wrapLines: boolean;
  bordered?: boolean;
  copyable?: boolean;
  customStyle?: React.CSSProperties;
  padded?: boolean;
};

export function TwigCodeViewer({
  code,
  showLineNumbers,
  wrapLines,
  bordered = false,
  copyable = false,
  customStyle,
  padded = true,
}: TwigCodeViewerProps): React.ReactElement {
  return React.createElement(
    SyntaxHighlighter,
    {
      bordered,
      copyable,
      customStyle: {
        ...styles.codeContainer,
        ...customStyle,
      },
      format: false,
      language: 'twig' as SupportedLanguage,
      padded,
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
