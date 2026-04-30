import { useParameter } from 'storybook/manager-api';

import { PARAM_KEY } from '../constants';
import { collectTwigSource } from '../runtime/collectSource';
import type { TwigAddonOptions, TwigSourceParameter } from '../types';
import { TwigCodeViewer } from './TwigCodeViewer';

type TwigPanelProps = {
  active: boolean;
  options?: TwigAddonOptions;
};

export function TwigPanel({ active, options }: TwigPanelProps) {
  const parameter = useParameter<TwigSourceParameter | undefined>(PARAM_KEY, undefined);
  const source = collectTwigSource(parameter);

  if (!active) {
    return null;
  }

  if (!source) {
    return (
      <div className="satw-panel satw-panel--empty">
        <strong>No Twig source configured</strong>
        <p>
          Add <code>parameters.twig.source</code> to this story.
        </p>
      </div>
    );
  }

  return <TwigCodeViewer code={source.code} fileName={source.fileName} options={options} parameter={parameter} />;
}
