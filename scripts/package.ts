import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSZip from 'jszip';
import { buildAll } from './build';
import { packCrx } from './crx';
import { DIST_DIR, fromRoot } from './paths';
import { loadSigningKey } from './signing-key';
import { resolveVersion } from './version';

const RELEASE_DIR = fromRoot('release');

async function zipDist(): Promise<Buffer> {
  const zip = new JSZip();
  const glob = new Bun.Glob('**/*');
  for await (const path of glob.scan({ cwd: DIST_DIR, onlyFiles: true })) {
    zip.file(path.split('\\').join('/'), await readFile(resolve(DIST_DIR, path)));
  }
  const bytes = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  return bytes;
}

async function write(name: string, data: Buffer | Uint8Array): Promise<void> {
  const output = resolve(RELEASE_DIR, name);
  await Bun.write(output, data);
  console.log(`  → ${name} (${(data.length / 1024).toFixed(0)} KB)`);
}

async function packageChrome(version: string): Promise<void> {
  await buildAll('chrome');
  const zip = await zipDist();
  const key = await loadSigningKey();
  console.log('Packaging chrome:');
  await write(`octonext-chrome-v${version}.zip`, zip);
  await write(`octonext-chrome-v${version}.crx`, packCrx(zip, key.publicKeyDer, key.privateKeyPem));
}

async function packageFirefox(version: string): Promise<void> {
  await buildAll('firefox');
  const zip = await zipDist();
  console.log('Packaging firefox:');
  await write(`octonext-firefox-v${version}.zip`, zip);
  await write(`octonext-firefox-v${version}.xpi`, zip);
}

async function main(): Promise<void> {
  const version = await resolveVersion();
  await mkdir(RELEASE_DIR, { recursive: true });
  await packageFirefox(version);
  await packageChrome(version);
}

await main();
