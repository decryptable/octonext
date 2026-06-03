import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { ICONS_DIR, fromRoot } from './paths';

const SIZES = [16, 32, 48, 128];
let ready: Promise<void> | undefined;

async function ensureWasm(): Promise<void> {
  const require = createRequire(import.meta.url);
  ready ??= initWasm(await readFile(require.resolve('@resvg/resvg-wasm/index_bg.wasm')));
  await ready;
}

export async function renderIcons(): Promise<void> {
  await ensureWasm();
  await mkdir(ICONS_DIR, { recursive: true });
  const svg = await readFile(fromRoot('public', 'icon.svg'), 'utf8');
  for (const size of SIZES) {
    const renderer = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
    await Bun.write(`${ICONS_DIR}/icon${size}.png`, renderer.render().asPng());
  }
}

if (import.meta.main) {
  await renderIcons();
  console.log(`Rendered ${SIZES.length} PNG icons in ${ICONS_DIR}`);
}
