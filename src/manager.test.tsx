// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ADDON_ID, OPTIONS_GLOBAL, PANEL_ID } from './constants';

const addMock = vi.hoisted(() => vi.fn());
const registerMock = vi.hoisted(() => vi.fn((_id: string, callback: () => void) => callback()));
const installAddonStylesMock = vi.hoisted(() => vi.fn());

vi.mock('storybook/manager-api', () => ({
  addons: {
    add: addMock,
    register: registerMock,
  },
  types: {
    PANEL: 'panel',
  },
}));

vi.mock('./styles', () => ({
  installAddonStyles: installAddonStylesMock,
}));

vi.mock('./panel/TwigPanel', () => ({
  TwigPanel: ({ active }: { active: boolean }) => <div data-testid="twig-panel">{String(active)}</div>,
}));

describe('manager entry', () => {
  beforeEach(() => {
    vi.resetModules();
    addMock.mockClear();
    registerMock.mockClear();
    installAddonStylesMock.mockClear();
    delete window[OPTIONS_GLOBAL];
  });

  it('registers the Twig panel with normalized default options', async () => {
    await import('./manager');

    expect(installAddonStylesMock).toHaveBeenCalledWith(document);
    expect(registerMock).toHaveBeenCalledWith(ADDON_ID, expect.any(Function));
    expect(addMock).toHaveBeenCalledWith(
      PANEL_ID,
      expect.objectContaining({
        title: 'Twig',
        type: 'panel',
      }),
    );
  });

  it('does not add the panel when it is disabled', async () => {
    window[OPTIONS_GLOBAL] = { panel: false };

    await import('./manager');

    expect(registerMock).toHaveBeenCalledWith(ADDON_ID, expect.any(Function));
    expect(addMock).not.toHaveBeenCalled();
  });

  it('passes active state and raw global options to the panel renderer', async () => {
    window[OPTIONS_GLOBAL] = {
      copy: false,
      theme: 'github-light',
    };

    await import('./manager');

    const [, panelDefinition] = addMock.mock.calls[0] as [string, { render: (props: { active?: boolean }) => unknown }];

    expect(panelDefinition.render({ active: 1 as unknown as boolean })).toMatchObject({
      props: expect.objectContaining({
        active: true,
        options: {
          copy: false,
          theme: 'github-light',
        },
      }),
    });
  });
});
