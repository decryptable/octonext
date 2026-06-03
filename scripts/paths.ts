import { dirname, resolve } from 'node:path';

export const ROOT = resolve(import.meta.dir, '..');
export const SRC_DIR = resolve(ROOT, 'src');
export const DIST_DIR = resolve(ROOT, 'dist');
export const PUBLIC_DIR = resolve(ROOT, 'public');
export const ICONS_DIR = resolve(PUBLIC_DIR, 'icons');
export const STYLES_DIR = resolve(SRC_DIR, 'styles');
export const OPTIONS_SRC_DIR = resolve(SRC_DIR, 'options');

export function fromRoot(...segments: string[]): string {
  return resolve(ROOT, ...segments);
}

export function ensureParent(path: string): string {
  return dirname(path);
}
