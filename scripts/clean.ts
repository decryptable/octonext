import { rm } from 'node:fs/promises';
import { DIST_DIR } from './paths';

await rm(DIST_DIR, { recursive: true, force: true });
console.log(`Removed ${DIST_DIR}`);
