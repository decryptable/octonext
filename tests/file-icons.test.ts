import { expect, test } from 'bun:test';
import { fileIconFile, fileIconName, folderIconFile } from '../src/core/icons/file-icons';
import type { IconManifest } from '../src/core/icons/icon-manifest';

const manifest: IconManifest = {
  file: 'file',
  folder: 'folder',
  folderExpanded: 'folder-open',
  fileExtensions: { ts: 'typescript', 'instructions.md': 'instructions' },
  fileNames: { dockerfile: 'docker' },
  folderNames: { instructions: 'folder-instructions' },
  folderNamesExpanded: { instructions: 'folder-instructions-open' },
  definitions: {
    file: 'file',
    folder: 'folder',
    'folder-open': 'folder-open',
    typescript: 'typescript',
    docker: 'docker',
    instructions: 'instructions.clone',
    'folder-instructions': 'folder-instructions.clone',
    'folder-instructions-open': 'folder-instructions-open.clone',
  },
};

test('resolves a known file name', () => {
  expect(fileIconName(manifest, 'Dockerfile')).toBe('docker');
});

test('maps cloned icon names to their real file base', () => {
  expect(fileIconFile(manifest, 'accessibility.instructions.md')).toBe('instructions.clone');
  expect(folderIconFile(manifest, 'instructions', false)).toBe('folder-instructions.clone');
  expect(folderIconFile(manifest, 'instructions', true)).toBe('folder-instructions-open.clone');
});

test('falls back to default icon file base', () => {
  expect(fileIconFile(manifest, 'unknown.xyz')).toBe('file');
  expect(folderIconFile(manifest, 'misc', false)).toBe('folder');
});
