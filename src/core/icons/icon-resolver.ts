import type { IconPack } from '../../shared/settings';
import { type IconManifest, EMPTY_MANIFEST, loadIconManifest } from './icon-manifest';
import { fileIconFile, folderIconFile } from './file-icons';
import { iconUrl } from './icon-url';

export class IconResolver {
  private constructor(
    private readonly manifest: IconManifest,
    private readonly pack: IconPack,
  ) {}

  static async create(pack: IconPack): Promise<IconResolver> {
    const manifest = pack === 'material' ? await loadIconManifest() : EMPTY_MANIFEST;
    return new IconResolver(manifest, pack);
  }

  get enabled(): boolean {
    return this.pack === 'material';
  }

  fileUrl(fileName: string): string | null {
    if (this.pack !== 'material') return null;
    return iconUrl(fileIconFile(this.manifest, fileName));
  }

  folderUrl(folderName: string, expanded: boolean): string | null {
    if (this.pack !== 'material') return null;
    return iconUrl(folderIconFile(this.manifest, folderName, expanded));
  }

  fallbackFileUrl(): string {
    return iconUrl(this.manifest.file);
  }

  fallbackFolderUrl(expanded: boolean): string {
    return iconUrl(expanded ? this.manifest.folderExpanded : this.manifest.folder);
  }
}
