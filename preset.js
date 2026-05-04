import { URL, fileURLToPath } from 'node:url';

const previewEntry = fileURLToPath(new URL('./preview.js', import.meta.url));
const managerEntry = fileURLToPath(new URL('./manager.js', import.meta.url));

export const previewAnnotations = (entry = []) => [...entry, previewEntry];

export const managerEntries = (entry = []) => [...entry, managerEntry];

export * from './dist/preset.js';
