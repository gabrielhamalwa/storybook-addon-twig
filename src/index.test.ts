import { describe, expect, it, vi } from 'vitest';

const definePreviewAddonMock = vi.hoisted(() => vi.fn((preview: unknown) => ({ preview })));

vi.mock('storybook/internal/csf', () => ({
  definePreviewAddon: definePreviewAddonMock,
}));

vi.mock('./preview', () => ({
  decorators: [],
}));

describe('twigAddon', () => {
  it('defines the Storybook preview addon from the preview entry', async () => {
    const { default: twigAddon } = await import('./index');

    expect(twigAddon()).toEqual({ preview: { decorators: [] } });
    expect(definePreviewAddonMock).toHaveBeenCalledWith({ decorators: [] });
  });
});
