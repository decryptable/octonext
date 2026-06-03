import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSZip from 'jszip';
import type { BuildTarget } from '../src/manifest.config';
import { buildAll } from './build';
import { DIST_DIR, fromRoot } from './paths';

const TARGETS: BuildTarget[] = ['firefox', 'chrome'];
const RELEASE_DIR = fromRoot('release');

async function zipDist(): Promise<Uint8Array> {
  const zip = new JSZip();
  const glob = new Bun.Glob('**/*');
  for await (const path of glob.scan({ cwd: DIST_DIR, onlyFiles: true })) {
    zip.file(path.split('\\').join('/'), await readFile(resolve(DIST_DIR, path)));
  }
  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

async function packageTarget(target: BuildTarget, version: string): Promise<void> {
  await buildAll(target);
  const archive = await zipDist();
  const output = resolve(RELEASE_DIR, `octonext-${target}-v${version}.zip`);
  await Bun.write(output, archive);
  console.log(`Packaged ${target} → ${output} (${(archive.length / 1024).toFixed(0)} KB)`);
}

async function main(): Promise<void> {
  const pkg = (await Bun.file(fromRoot('package.json')).json()) as { version: string };
  await mkdir(RELEASE_DIR, { recursive: true });
  for (const target of TARGETS) await packageTarget(target, pkg.version);
}

await main();
