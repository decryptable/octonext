import { type Zippable, zip } from 'fflate';
import { mapLimit } from './concurrency';
import { fetchBlobBytes } from './github/blobs';
import type { RepoRef, TreeNode } from './types';

const CONCURRENCY = 8;

export interface DownloadProgress {
  done: number;
  total: number;
}

export interface DownloadOptions {
  token?: string;
  signal?: AbortSignal;
  onProgress?: (progress: DownloadProgress) => void;
}

export async function downloadNodes(
  blobs: TreeNode[],
  ref: RepoRef,
  options: DownloadOptions = {},
): Promise<void> {
  const files = blobs.filter((node) => node.type === 'blob');
  if (files.length === 0) return;
  if (files.length === 1) {
    const file = files[0]!;
    const bytes = await fetchBlobBytes(ref, file.sha, options.token, options.signal);
    options.onProgress?.({ done: 1, total: 1 });
    saveBlob(new Blob([bytes as BlobPart]), file.name);
    return;
  }
  await downloadZip(files, ref, options);
}

async function downloadZip(
  files: TreeNode[],
  ref: RepoRef,
  options: DownloadOptions,
): Promise<void> {
  const entries: Zippable = {};
  let done = 0;
  await mapLimit(files, CONCURRENCY, async (file) => {
    const bytes = await fetchBlobBytes(ref, file.sha, options.token, options.signal);
    entries[file.path] = bytes;
    done += 1;
    options.onProgress?.({ done, total: files.length });
  });
  if (options.signal?.aborted) return;
  const archive = await zipArchive(entries);
  saveBlob(new Blob([archive as BlobPart]), `${ref.repo}-${ref.branch}.zip`);
}

function zipArchive(entries: Zippable): Promise<Uint8Array> {
  return new Promise((resolveZip, reject) => {
    zip(entries, { level: 6 }, (error, data) => (error ? reject(error) : resolveZip(data)));
  });
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
