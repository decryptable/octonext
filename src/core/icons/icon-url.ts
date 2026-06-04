import { browser } from '../../shared/browser';

export function iconUrl(fileBase: string, dir: string): string {
  return browser.runtime.getURL(`${dir}/${fileBase}.svg`);
}
