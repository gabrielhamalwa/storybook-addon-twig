import React, { useMemo } from 'react';
import { SyntaxHighlighter } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import { mergeSourceOptions, normalizeOptions } from '../options';
import type { TwigAddonOptions, TwigSourceParameter } from '../types';

type TwigCodeViewerProps = {
  code: string;
  options?: TwigAddonOptions;
  parameter?: TwigSourceParameter;
};

const TWIG_LANGUAGE = 'twig' as 'html';

export function TwigCodeViewer({ code, options, parameter }: TwigCodeViewerProps): React.ReactElement {
  const resolvedOptions = useMemo(() => mergeSourceOptions(normalizeOptions(options), parameter), [options, parameter]);

  return React.createElement(
    SourcePanel,
    null,
    React.createElement(
      SyntaxHighlighter,
      {
        bordered: false,
        copyable: resolvedOptions.copy,
        format: 'dedent',
        language: TWIG_LANGUAGE,
        padded: true,
        showLineNumbers: resolvedOptions.showLineNumbers,
        wrapLongLines: resolvedOptions.wrapLines,
      },
      code,
    ),
  );
}

const SourcePanel = styled.div({
  height: '100%',
  '> :first-child': {
    height: '100%',
    margin: 0,
  },
});
