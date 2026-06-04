import type { IconPack } from '../../shared/settings';
import { ICON_PACK_DIRS } from '../../shared/constants';
import { type IconManifest, EMPTY_MANIFEST, loadIconManifest } from './icon-manifest';
import { fileIconFile, folderIconFile, iconFileBase } from './file-icons';
import { iconUrl } from './icon-url';

const PACK_DIRS = ICON_PACK_DIRS as Record<string, string | undefined>;

export class IconResolver {
  private constructor(
    private readonly manifest: IconManifest,
    private readonly dir: string | undefined,
  ) {}

  static async create(pack: IconPack): Promise<IconResolver> {
    const dir = PACK_DIRS[pack];
    const manifest = dir ? await loadIconManifest(dir) : EMPTY_MANIFEST;
    return new IconResolver(manifest, dir);
  }

  get enabled(): boolean {
    return this.dir !== undefined;
  }

  fileUrl(fileName: string): string | null {
    if (!this.dir) return null;
    return iconUrl(fileIconFile(this.manifest, fileName), this.dir);
  }

  folderUrl(folderName: string, expanded: boolean): string | null {
    if (!this.dir) return null;
    return iconUrl(folderIconFile(this.manifest, folderName, expanded), this.dir);
  }

  fallbackFileUrl(): string {
    return iconUrl(
      iconFileBase(this.manifest, this.manifest.file),
      this.dir ?? ICON_PACK_DIRS.material,
    );
  }

  fallbackFolderUrl(expanded: boolean): string {
    const name = expanded ? this.manifest.folderExpanded : this.manifest.folder;
    return iconUrl(iconFileBase(this.manifest, name), this.dir ?? ICON_PACK_DIRS.material);
  }
}
