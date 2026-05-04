export const previewAnnotations = (entry = []) => [...entry, import.meta.resolve('./dist/preview.js')];

export const managerEntries = (entry = []) => [...entry, import.meta.resolve('./dist/manager.js')];

export * from './dist/preset.js';
