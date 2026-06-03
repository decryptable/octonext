import JSZip from 'jszip';
import type { RepoRef, TreeNode } from './types';
import { fetchBlobBytes } from './github/blobs';

export interface DownloadProgress {
  done: number;
  total: number;
}

export async function downloadNodes(
  blobs: TreeNode[],
  ref: RepoRef,
  token: string | undefined,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  const files = blobs.filter((node) => node.type === 'blob');
  if (files.length === 0) return;
  if (files.length === 1) {
    const file = files[0]!;
    const bytes = await fetchBlobBytes(ref, file.sha, token);
    onProgress?.({ done: 1, total: 1 });
    saveBlob(new Blob([bytes as BlobPart]), file.name);
    return;
  }
  await downloadZip(files, ref, token, onProgress);
}

async function downloadZip(
  files: TreeNode[],
  ref: RepoRef,
  token: string | undefined,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<void> {
  const zip = new JSZip();
  let done = 0;
  for (const file of files) {
    const bytes = await fetchBlobBytes(ref, file.sha, token);
    zip.file(file.path, bytes);
    done += 1;
    onProgress?.({ done, total: files.length });
  }
  const archive = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  saveBlob(archive, `${ref.repo}-${ref.branch}.zip`);
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
