import { resolve } from 'node:path';
import { STYLES_DIR } from './paths';

const CORE_ORDER = [
  'base.css',
  'sidebar.css',
  'tabs.css',
  'tree.css',
  'results.css',
  'panels.css',
  'toggle.css',
  'components.css',
  'native.css',
  'download.css',
  'interactions.css',
  'polish.css',
];

export async function collectStyles(): Promise<string> {
  const themesDir = resolve(STYLES_DIR, 'themes');
  const themes: string[] = [];
  const glob = new Bun.Glob('*.css');
  for await (const file of glob.scan({ cwd: themesDir, onlyFiles: true })) themes.push(file);
  themes.sort();

  const paths = [
    ...CORE_ORDER.map((name) => resolve(STYLES_DIR, name)),
    ...themes.map((name) => resolve(themesDir, name)),
  ];
  const parts = await Promise.all(paths.map((path) => Bun.file(path).text()));
  return parts.join('\n');
}
