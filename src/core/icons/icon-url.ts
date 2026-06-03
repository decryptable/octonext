import { ASSET_PATHS } from '../../shared/constants';
import { browser } from '../../shared/browser';

export function iconUrl(fileBase: string): string {
  return browser.runtime.getURL(`${ASSET_PATHS.materialDir}/${fileBase}.svg`);
}
