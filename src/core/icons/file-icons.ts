import type { IconManifest } from './icon-manifest';

export function fileIconName(manifest: IconManifest, fileName: string): string {
  const lower = fileName.toLowerCase();
  if (manifest.fileNames[lower]) return manifest.fileNames[lower];

  const parts = lower.split('.');
  for (let i = 1; i < parts.length; i += 1) {
    const ext = parts.slice(i).join('.');
    if (manifest.fileExtensions[ext]) return manifest.fileExtensions[ext];
  }
  return manifest.file;
}

export function folderIconName(
  manifest: IconManifest,
  folderName: string,
  expanded: boolean,
): string {
  const lower = folderName.toLowerCase();
  const map = expanded ? manifest.folderNamesExpanded : manifest.folderNames;
  if (map[lower]) return map[lower];
  return expanded ? manifest.folderExpanded : manifest.folder;
}

export function iconFileBase(manifest: IconManifest, iconName: string): string {
  return manifest.definitions[iconName] ?? iconName;
}

export function fileIconFile(manifest: IconManifest, fileName: string): string {
  return iconFileBase(manifest, fileIconName(manifest, fileName));
}

export function folderIconFile(
  manifest: IconManifest,
  folderName: string,
  expanded: boolean,
): string {
  return iconFileBase(manifest, folderIconName(manifest, folderName, expanded));
}
