import { generateKeyPairSync, createPublicKey } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fromRoot } from './paths';

const KEY_DIR = fromRoot('keys');
const KEY_PATH = resolve(KEY_DIR, 'octonext.pem');

export interface SigningKey {
  privateKeyPem: string;
  publicKeyDer: Buffer;
}

function fromEnv(): string | undefined {
  const value = process.env.CRX_PRIVATE_KEY;
  if (!value) return undefined;
  return value.includes('BEGIN') ? value : Buffer.from(value, 'base64').toString('utf8');
}

export async function loadSigningKey(): Promise<SigningKey> {
  await mkdir(KEY_DIR, { recursive: true });
  const privateKeyPem =
    fromEnv() ?? (existsSync(KEY_PATH) ? await readFile(KEY_PATH, 'utf8') : await createKey());
  const publicKeyDer = createPublicKey(privateKeyPem).export({ type: 'spki', format: 'der' });
  return { privateKeyPem, publicKeyDer: publicKeyDer as Buffer };
}

async function createKey(): Promise<string> {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  await writeFile(KEY_PATH, pem, 'utf8');
  return pem;
}
