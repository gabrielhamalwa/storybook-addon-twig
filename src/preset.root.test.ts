// @vitest-environment node

import { describe, expect, it } from 'vitest';

describe('package-root preset entry', () => {
  it('registers preview and manager entries through the root preset file', async () => {
    const preset = await import('../preset.js');

    expect(preset.previewAnnotations()).toEqual(expect.arrayContaining([expect.stringMatching(/preview\.js$/)]));
    expect(preset.managerEntries()).toEqual(expect.arrayContaining([expect.stringMatching(/manager\.js$/)]));
  });
});
