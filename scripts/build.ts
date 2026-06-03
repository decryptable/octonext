import { watch as watchFs } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { type BuildTarget, buildManifest } from '../src/manifest.config';
import { copyAppIcons, copyFileIcons, copyFonts, copyOptions } from './assets';
import { DIST_DIR, SRC_DIR, fromRoot } from './paths';
import { collectStyles } from './styles';

const WATCH = process.argv.includes('--watch');

const ENTRIES = [
  { entry: 'content/index.ts', out: 'content.js', format: 'iife' as const },
  { entry: 'background/index.ts', out: 'background.js', format: 'iife' as const },
  { entry: 'options/options.ts', out: 'options/options.js', format: 'esm' as const },
];

async function bundleScripts(minify: boolean): Promise<void> {
  for (const { entry, out, format } of ENTRIES) {
    const result = await Bun.build({
      entrypoints: [resolve(SRC_DIR, entry)],
      target: 'browser',
      format,
      minify,
      sourcemap: minify ? 'none' : 'linked',
    });
    if (!result.success) throw new AggregateError(result.logs, `Failed to bundle ${entry}`);
    await Bun.write(resolve(DIST_DIR, out), result.outputs[0]!);
  }
}

async function bundleStyles(minify: boolean): Promise<void> {
  const out = resolve(DIST_DIR, 'content.css');
  await Bun.write(out, await collectStyles());
  if (!minify) return;
  const result = await Bun.build({ entrypoints: [out], minify: true });
  if (result.success) await Bun.write(out, result.outputs[0]!);
}

async function writeManifest(target: BuildTarget): Promise<void> {
  const pkg = (await Bun.file(fromRoot('package.json')).json()) as { version: string };
  const manifest = buildManifest(pkg.version, target);
  await Bun.write(resolve(DIST_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

async function rebuildCode(minify: boolean, target: BuildTarget): Promise<void> {
  await Promise.all([
    bundleScripts(minify),
    bundleStyles(minify),
    writeManifest(target),
    copyOptions(minify),
  ]);
}

export async function buildAll(target: BuildTarget = 'chrome', minify = true): Promise<void> {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });
  await Promise.all([rebuildCode(minify, target), copyAppIcons(), copyFileIcons(), copyFonts()]);
  console.log(`Built OctoNext (${target}) → ${DIST_DIR}`);
}

async function watch(): Promise<void> {
  await buildAll('chrome', false);
  console.log('Watching src/ for changes…');
  let pending: ReturnType<typeof setTimeout> | undefined;
  watchFs(SRC_DIR, { recursive: true }, () => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      rebuildCode(false, 'chrome')
        .then(() => console.log(`Rebuilt at ${new Date().toLocaleTimeString()}`))
        .catch((error) => console.error(error));
    }, 120);
  });
}

if (import.meta.main) await (WATCH ? watch() : buildAll('chrome'));
