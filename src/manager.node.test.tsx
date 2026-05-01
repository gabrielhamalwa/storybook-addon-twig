// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ADDON_ID, PANEL_ID } from './constants';

const addMock = vi.hoisted(() => vi.fn());
const registerMock = vi.hoisted(() => vi.fn((_id: string, callback: () => void) => callback()));

vi.mock('storybook/manager-api', () => ({
  addons: {
    add: addMock,
    register: registerMock,
  },
  types: {
    PANEL: 'panel',
  },
}));

vi.mock('./panel/TwigPanel', () => ({
  TwigPanel: ({ active }: { active: boolean }) => <div data-testid="twig-panel">{String(active)}</div>,
}));

describe('manager entry without browser globals', () => {
  beforeEach(() => {
    vi.resetModules();
    addMock.mockClear();
    registerMock.mockClear();
  });

  it('can be imported for metadata without browser globals', async () => {
    await import('./manager');

    expect(registerMock).toHaveBeenCalledWith(ADDON_ID, expect.any(Function));
    expect(addMock).toHaveBeenCalledWith(
      PANEL_ID,
      expect.objectContaining({
        title: 'Twig',
        type: 'panel',
      }),
    );
  });
});
