import { cp, mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { DIST_DIR, OPTIONS_SRC_DIR, PUBLIC_DIR } from './paths';
import { renderIcons } from './render-icons';
import { collectThemeStyles } from './styles';

const MATERIAL_KEYS = [
  'file',
  'folder',
  'folderExpanded',
  'fileExtensions',
  'fileNames',
  'folderNames',
  'folderNamesExpanded',
] as const;

interface IconDefinition {
  iconPath: string;
}

function materialRoot(): string {
  const require = createRequire(import.meta.url);
  return dirname(require.resolve('material-icon-theme/package.json'));
}

function fileBase(iconPath: string): string {
  return iconPath
    .split('/')
    .pop()!
    .replace(/\.svg$/, '');
}

async function writeIconManifest(root: string): Promise<void> {
  const full = JSON.parse(await readFile(resolve(root, 'dist/material-icons.json'), 'utf8'));
  const trimmed: Record<string, unknown> = Object.fromEntries(
    MATERIAL_KEYS.map((key) => [key, full[key]]),
  );
  const definitions = full.iconDefinitions as Record<string, IconDefinition>;
  trimmed.definitions = Object.fromEntries(
    Object.entries(definitions).map(([name, def]) => [name, fileBase(def.iconPath)]),
  );
  await Bun.write(resolve(DIST_DIR, 'icons/material/manifest.json'), JSON.stringify(trimmed));
}

export async function copyFileIcons(): Promise<void> {
  const root = materialRoot();
  await mkdir(resolve(DIST_DIR, 'icons/material'), { recursive: true });
  await cp(resolve(root, 'icons'), resolve(DIST_DIR, 'icons/material'), { recursive: true });
  await writeIconManifest(root);
}

export async function copyAppIcons(): Promise<void> {
  await renderIcons();
  await cp(resolve(PUBLIC_DIR, 'icons'), resolve(DIST_DIR, 'icons'), { recursive: true });
  await cp(resolve(PUBLIC_DIR, 'icon.svg'), resolve(DIST_DIR, 'icon.svg'));
}

export async function copyFonts(): Promise<void> {
  await cp(resolve(PUBLIC_DIR, 'fonts'), resolve(DIST_DIR, 'fonts'), { recursive: true });
}

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function writeCss(src: string, dest: string, minify: boolean): Promise<void> {
  if (!minify) return void (await cp(src, dest));
  const result = await Bun.build({ entrypoints: [src], minify: true });
  await Bun.write(dest, result.success ? result.outputs[0]! : Bun.file(src));
}

async function writeThemeCss(dest: string, minify: boolean): Promise<void> {
  await Bun.write(dest, await collectThemeStyles());
  if (!minify) return;
  const result = await Bun.build({ entrypoints: [dest], minify: true });
  if (result.success) await Bun.write(dest, result.outputs[0]!);
}

export async function copyOptions(minify = false): Promise<void> {
  await mkdir(resolve(DIST_DIR, 'options'), { recursive: true });
  const html = await Bun.file(resolve(OPTIONS_SRC_DIR, 'index.html')).text();
  await Bun.write(resolve(DIST_DIR, 'options/index.html'), minify ? minifyHtml(html) : html);
  await writeCss(
    resolve(OPTIONS_SRC_DIR, 'options.css'),
    resolve(DIST_DIR, 'options/options.css'),
    minify,
  );
  await writeThemeCss(resolve(DIST_DIR, 'options/themes.css'), minify);
}
