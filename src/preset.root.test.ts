// @vitest-environment node

import { describe, expect, it } from 'vitest';

describe('package-root preset entry', () => {
  it('re-exports the dist preset hooks through the root preset file', async () => {
    const preset = await import('../preset.js');

    expect(preset).toHaveProperty('managerHead');
    expect(preset).toHaveProperty('previewHead');
  });
});
