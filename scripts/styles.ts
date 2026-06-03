import { resolve } from 'node:path';
import { STYLES_DIR } from './paths';

const CORE_ORDER = [
  'base.css',
  'sidebar.css',
  'tabs.css',
  'tree.css',
  'results.css',
  'pr.css',
  'pr-list.css',
  'pr-foot.css',
  'panels.css',
  'toggle.css',
  'components.css',
  'native.css',
  'download.css',
  'interactions.css',
  'polish.css',
];

async function themeFiles(): Promise<string[]> {
  const themesDir = resolve(STYLES_DIR, 'themes');
  const themes: string[] = [];
  const glob = new Bun.Glob('*.css');
  for await (const file of glob.scan({ cwd: themesDir, onlyFiles: true })) themes.push(file);
  return themes.sort().map((name) => resolve(themesDir, name));
}

export async function collectStyles(): Promise<string> {
  const paths = [...CORE_ORDER.map((name) => resolve(STYLES_DIR, name)), ...(await themeFiles())];
  const parts = await Promise.all(paths.map((path) => Bun.file(path).text()));
  return parts.join('\n');
}

export async function collectThemeStyles(): Promise<string> {
  const parts = await Promise.all((await themeFiles()).map((path) => Bun.file(path).text()));
  return parts.join('\n');
}
