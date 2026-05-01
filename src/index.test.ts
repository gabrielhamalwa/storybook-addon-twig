import { describe, expect, it } from 'vitest';

describe('public entry', () => {
  it('does not import Storybook runtime modules from the package root', async () => {
    const entry = await import('./index');

    expect(Object.keys(entry)).toEqual([]);
  });
});
