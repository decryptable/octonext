import type { RepoRef } from '../types';
import { getJson } from './client';
import { blobEndpoint } from './endpoints';

interface BlobResponse {
  content: string;
  encoding: string;
}

export async function fetchBlobBytes(
  ref: RepoRef,
  sha: string,
  token?: string,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const url = blobEndpoint(ref.host, ref.owner, ref.repo, sha);
  const blob = await getJson<BlobResponse>(url, token, signal);
  if (blob.encoding === 'base64') return base64ToBytes(blob.content);
  return new TextEncoder().encode(blob.content);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
