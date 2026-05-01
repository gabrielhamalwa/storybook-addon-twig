import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distDirectory = path.join(root, 'dist');

if (!existsSync(distDirectory)) {
  fail('dist/ is missing. Run the build before checking the package.');
}

const distFiles = await listFiles(distDirectory);
const mapFiles = distFiles.filter((file) => file.endsWith('.map'));

if (mapFiles.length > 0) {
  fail(`dist/ contains sourcemap files:\n${formatFiles(mapFiles)}`);
}

const sourceMapReferences = [];
const jsxRuntimeReferences = [];
const forbiddenRuntimeReferences = new Map([
  ['storybook/internal/csf', []],
  ['semver', []],
]);

for (const file of distFiles.filter((candidate) => candidate.endsWith('.js'))) {
  const contents = await readFile(file, 'utf8');

  if (contents.includes('sourceMappingURL')) {
    sourceMapReferences.push(file);
  }

  if (contents.includes('react/jsx-runtime')) {
    jsxRuntimeReferences.push(file);
  }

  for (const [reference, files] of forbiddenRuntimeReferences) {
    if (contents.includes(reference)) {
      files.push(file);
    }
  }
}

if (sourceMapReferences.length > 0) {
  fail(`Published JavaScript references sourcemaps:\n${formatFiles(sourceMapReferences)}`);
}

if (jsxRuntimeReferences.length > 0) {
  fail(`Published JavaScript references react/jsx-runtime:\n${formatFiles(jsxRuntimeReferences)}`);
}

for (const [reference, files] of forbiddenRuntimeReferences) {
  if (files.length > 0) {
    fail(`Published JavaScript references ${reference}:\n${formatFiles(files)}`);
  }
}

const packedFiles = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: root,
  encoding: 'utf8',
});
const [packResult] = JSON.parse(packedFiles);
const packageFiles = packResult.files.map((file) => file.path);
const requiredFiles = [
  'LICENSE',
  'README.md',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/manager.js',
  'dist/preset.d.ts',
  'dist/preset.js',
  'dist/preview.d.ts',
  'dist/preview.js',
  'manager.js',
  'package.json',
  'preset.js',
  'preview.js',
];
const missingFiles = requiredFiles.filter((file) => !packageFiles.includes(file));

if (missingFiles.length > 0) {
  fail(`Package tarball is missing required files:\n${formatFiles(missingFiles)}`);
}

const packedMaps = packageFiles.filter((file) => file.endsWith('.map'));

if (packedMaps.length > 0) {
  fail(`Package tarball contains sourcemap files:\n${formatFiles(packedMaps)}`);
}

console.log(`Package artifact check passed with ${packageFiles.length} files.`);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : entryPath;
    }),
  );

  return files.flat();
}

function formatFiles(files) {
  return files.map((file) => `- ${path.relative(root, file) || file}`).join('\n');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
