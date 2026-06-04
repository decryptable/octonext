import { browser } from '../../shared/browser';

export interface IconManifest {
  file: string;
  folder: string;
  folderExpanded: string;
  fileExtensions: Record<string, string>;
  fileNames: Record<string, string>;
  folderNames: Record<string, string>;
  folderNamesExpanded: Record<string, string>;
  definitions: Record<string, string>;
}

export const EMPTY_MANIFEST: IconManifest = {
  file: 'file',
  folder: 'folder',
  folderExpanded: 'folder-open',
  fileExtensions: {},
  fileNames: {},
  folderNames: {},
  folderNamesExpanded: {},
  definitions: {},
};

const cache = new Map<string, Promise<IconManifest>>();

export function loadIconManifest(dir: string): Promise<IconManifest> {
  let pending = cache.get(dir);
  if (!pending) {
    pending = fetchManifest(dir);
    cache.set(dir, pending);
  }
  return pending;
}

async function fetchManifest(dir: string): Promise<IconManifest> {
  try {
    const url = browser.runtime.getURL(`${dir}/icons.json`);
    const response = await fetch(url);
    return { ...EMPTY_MANIFEST, ...((await response.json()) as Partial<IconManifest>) };
  } catch {
    return EMPTY_MANIFEST;
  }
}
