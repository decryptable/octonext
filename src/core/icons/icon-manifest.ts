import { ASSET_PATHS } from '../../shared/constants';
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

let cache: Promise<IconManifest> | undefined;

export function loadIconManifest(): Promise<IconManifest> {
  cache ??= fetchManifest();
  return cache;
}

async function fetchManifest(): Promise<IconManifest> {
  try {
    const url = browser.runtime.getURL(ASSET_PATHS.iconManifest);
    const response = await fetch(url);
    return { ...EMPTY_MANIFEST, ...((await response.json()) as Partial<IconManifest>) };
  } catch {
    return EMPTY_MANIFEST;
  }
}
