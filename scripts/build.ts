import { cp, mkdir, readdir, rm, watch as fsWatch } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildManifest } from '../src/manifest.config';
import { generateIcons } from './generate-icons';
import { DIST_DIR, ICONS_DIR, OPTIONS_SRC_DIR, SRC_DIR, STYLES_DIR, fromRoot } from './paths';

const WATCH = process.argv.includes('--watch');
const MINIFY = !WATCH;

const ENTRIES = [
  { entry: 'content/index.ts', out: 'content.js', format: 'iife' as const },
  { entry: 'background/index.ts', out: 'background.js', format: 'esm' as const },
  { entry: 'options/options.ts', out: 'options/options.js', format: 'esm' as const },
];

async function bundleScripts(): Promise<void> {
  for (const { entry, out, format } of ENTRIES) {
    const result = await Bun.build({
      entrypoints: [resolve(SRC_DIR, entry)],
      target: 'browser',
      format,
      minify: MINIFY,
      sourcemap: WATCH ? 'linked' : 'none',
    });
    if (!result.success) throw new AggregateError(result.logs, `Failed to bundle ${entry}`);
    await Bun.write(resolve(DIST_DIR, out), result.outputs[0]!);
  }
}

async function bundleStyles(): Promise<void> {
  const files = (await readdir(STYLES_DIR)).filter((f) => f.endsWith('.css')).sort();
  const parts = await Promise.all(files.map((f) => Bun.file(resolve(STYLES_DIR, f)).text()));
  await Bun.write(resolve(DIST_DIR, 'content.css'), parts.join('\n'));
}

async function writeManifest(): Promise<void> {
  const pkg = (await Bun.file(fromRoot('package.json')).json()) as { version: string };
  const manifest = buildManifest(pkg.version);
  await Bun.write(resolve(DIST_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

async function copyAssets(): Promise<void> {
  await generateIcons();
  await cp(ICONS_DIR, resolve(DIST_DIR, 'icons'), { recursive: true });
  await cp(resolve(OPTIONS_SRC_DIR, 'index.html'), resolve(DIST_DIR, 'options/index.html'));
  await cp(resolve(OPTIONS_SRC_DIR, 'options.css'), resolve(DIST_DIR, 'options/options.css'));
}

async function buildAll(): Promise<void> {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(resolve(DIST_DIR, 'options'), { recursive: true });
  await Promise.all([bundleScripts(), bundleStyles(), writeManifest(), copyAssets()]);
  console.log(`Built OctoNext → ${DIST_DIR}`);
}

async function watch(): Promise<void> {
  await buildAll();
  console.log('Watching for changes…');
  const watcher = fsWatch(SRC_DIR, { recursive: true });
  let pending: ReturnType<typeof setTimeout> | undefined;
  for await (const _event of watcher) {
    clearTimeout(pending);
    pending = setTimeout(() => void buildAll().catch(console.error), 120);
  }
}

await (WATCH ? watch() : buildAll());
