export const previewAnnotations = (entry = []) => [...entry, import.meta.resolve('./preview.js')];

export const managerEntries = (entry = []) => [...entry, import.meta.resolve('./manager.js')];

export * from './dist/preset.js';
